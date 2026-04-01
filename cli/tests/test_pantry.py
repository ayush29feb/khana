import json
import os
import tempfile

import pytest
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from typer.testing import CliRunner

import food_tracker.db as db_module
from food_tracker.db import PANTRY_VIEW_SQL
from food_tracker.main import app
from food_tracker.models import Base


@pytest.fixture(autouse=True)
def isolated_db(monkeypatch):
    """Redirect the CLI's get_session() to a fresh temp SQLite DB for each test."""
    tmp = tempfile.NamedTemporaryFile(suffix=".db", delete=False)
    tmp.close()
    db_path = tmp.name

    monkeypatch.setenv("FOOD_DB_PATH", db_path)
    monkeypatch.setattr(db_module, "DB_PATH", db_path)

    engine = create_engine(f"sqlite:///{db_path}", echo=False)
    Base.metadata.create_all(engine)
    with engine.connect() as conn:
        for stmt in PANTRY_VIEW_SQL.split(";"):
            stmt = stmt.strip()
            if stmt:
                conn.execute(text(stmt))
        conn.commit()

    # Reset module-level singletons so get_session() re-initialises with the new DB
    monkeypatch.setattr(db_module, "_engine", None)
    monkeypatch.setattr(db_module, "SessionLocal", None)

    yield engine

    # Cleanup
    monkeypatch.setattr(db_module, "_engine", None)
    monkeypatch.setattr(db_module, "SessionLocal", None)
    engine.dispose()
    os.unlink(db_path)


@pytest.fixture
def runner():
    return CliRunner()


def _add_catalog_item(runner, name="Chicken Breast", brand="Generic", protein=31.0):
    """Helper to add a catalog item and return its ID."""
    result = runner.invoke(app, [
        "catalog", "add",
        "--name", name,
        "--brand", brand,
        "--serving-size-g", "100",
        "--protein", str(protein),
        "--carbs", "0",
        "--fat", "3.6",
    ])
    assert result.exit_code == 0, result.output
    return json.loads(result.output)["id"]


# ---------------------------------------------------------------------------
# pantry add
# ---------------------------------------------------------------------------

def test_pantry_add_success(runner):
    catalog_id = _add_catalog_item(runner)

    result = runner.invoke(app, [
        "pantry", "add",
        "--catalog-id", str(catalog_id),
        "--servings", "5",
    ])
    assert result.exit_code == 0, result.output
    data = json.loads(result.output)
    assert data["catalog_id"] == catalog_id
    assert data["delta"] == 5.0
    assert data["reason"] == "grocery"
    assert "id" in data
    assert "occurred_at" in data


def test_pantry_add_with_notes(runner):
    catalog_id = _add_catalog_item(runner)

    result = runner.invoke(app, [
        "pantry", "add",
        "--catalog-id", str(catalog_id),
        "--servings", "3",
        "--notes", "Bought at Costco",
    ])
    assert result.exit_code == 0, result.output
    data = json.loads(result.output)
    assert data["delta"] == 3.0


def test_pantry_add_bad_catalog_id(runner):
    result = runner.invoke(app, [
        "pantry", "add",
        "--catalog-id", "9999",
        "--servings", "2",
    ])
    assert result.exit_code == 1
    data = json.loads(result.output)
    assert data == {"error": "Catalog entry not found"}


# ---------------------------------------------------------------------------
# pantry use
# ---------------------------------------------------------------------------

def test_pantry_use_success(runner):
    catalog_id = _add_catalog_item(runner)

    # First add some stock
    runner.invoke(app, [
        "pantry", "add",
        "--catalog-id", str(catalog_id),
        "--servings", "10",
    ])

    result = runner.invoke(app, [
        "pantry", "use",
        "--catalog-id", str(catalog_id),
        "--servings", "2",
    ])
    assert result.exit_code == 0, result.output
    data = json.loads(result.output)
    assert data["catalog_id"] == catalog_id
    assert data["delta"] == -2.0
    assert data["reason"] == "manual"
    assert "id" in data
    assert "occurred_at" in data


def test_pantry_use_bad_catalog_id(runner):
    result = runner.invoke(app, [
        "pantry", "use",
        "--catalog-id", "9999",
        "--servings", "1",
    ])
    assert result.exit_code == 1
    data = json.loads(result.output)
    assert data == {"error": "Catalog entry not found"}


# ---------------------------------------------------------------------------
# pantry list
# ---------------------------------------------------------------------------

def test_pantry_list_empty(runner):
    result = runner.invoke(app, ["pantry", "list"])
    assert result.exit_code == 0, result.output
    data = json.loads(result.output)
    assert data == []


def test_pantry_list_with_items(runner):
    catalog_id = _add_catalog_item(runner, name="Eggs", brand="Farm Fresh", protein=6.0)

    # Add 10 servings
    runner.invoke(app, [
        "pantry", "add",
        "--catalog-id", str(catalog_id),
        "--servings", "10",
    ])
    # Use 3 servings
    runner.invoke(app, [
        "pantry", "use",
        "--catalog-id", str(catalog_id),
        "--servings", "3",
    ])

    result = runner.invoke(app, ["pantry", "list"])
    assert result.exit_code == 0, result.output
    data = json.loads(result.output)
    assert len(data) == 1

    item = data[0]
    assert item["catalog_id"] == catalog_id
    assert item["name"] == "Eggs"
    assert item["brand"] == "Farm Fresh"
    assert abs(item["servings_remaining"] - 7.0) < 0.001
    # protein_available = 7 * 6.0 = 42.0
    assert abs(item["protein_available"] - 42.0) < 0.001


def test_pantry_list_excludes_zero_remaining(runner):
    catalog_id = _add_catalog_item(runner, name="Milk", brand="Dairy Co", protein=8.0)

    # Add 2 servings then use all 2
    runner.invoke(app, ["pantry", "add", "--catalog-id", str(catalog_id), "--servings", "2"])
    runner.invoke(app, ["pantry", "use", "--catalog-id", str(catalog_id), "--servings", "2"])

    result = runner.invoke(app, ["pantry", "list"])
    assert result.exit_code == 0, result.output
    data = json.loads(result.output)
    # The pantry view filters HAVING SUM(delta) > 0 so fully consumed items should not appear
    assert data == []


# ---------------------------------------------------------------------------
# pantry history
# ---------------------------------------------------------------------------

def test_pantry_history_all(runner):
    catalog_id1 = _add_catalog_item(runner, name="Tofu", brand="Brand A", protein=10.0)
    catalog_id2 = _add_catalog_item(runner, name="Tempeh", brand="Brand B", protein=15.0)

    runner.invoke(app, ["pantry", "add", "--catalog-id", str(catalog_id1), "--servings", "5"])
    runner.invoke(app, ["pantry", "add", "--catalog-id", str(catalog_id2), "--servings", "3"])
    runner.invoke(app, ["pantry", "use", "--catalog-id", str(catalog_id1), "--servings", "1"])

    result = runner.invoke(app, ["pantry", "history"])
    assert result.exit_code == 0, result.output
    data = json.loads(result.output)
    assert len(data) == 3

    # Verify required fields are present
    for tx in data:
        assert "id" in tx
        assert "catalog_id" in tx
        assert "delta" in tx
        assert "reason" in tx
        assert "occurred_at" in tx


def test_pantry_history_filtered_by_catalog_id(runner):
    catalog_id1 = _add_catalog_item(runner, name="Lentils", brand="Brand X", protein=9.0)
    catalog_id2 = _add_catalog_item(runner, name="Quinoa", brand="Brand Y", protein=4.0)

    runner.invoke(app, ["pantry", "add", "--catalog-id", str(catalog_id1), "--servings", "8"])
    runner.invoke(app, ["pantry", "add", "--catalog-id", str(catalog_id2), "--servings", "4"])
    runner.invoke(app, ["pantry", "use", "--catalog-id", str(catalog_id1), "--servings", "2"])

    result = runner.invoke(app, ["pantry", "history", "--catalog-id", str(catalog_id1)])
    assert result.exit_code == 0, result.output
    data = json.loads(result.output)

    # Should only contain transactions for catalog_id1 (add +8 and use -2)
    assert len(data) == 2
    for tx in data:
        assert tx["catalog_id"] == catalog_id1
