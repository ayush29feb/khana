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


# ---------------------------------------------------------------------------
# catalog add
# ---------------------------------------------------------------------------

def test_catalog_add_success(runner):
    result = runner.invoke(app, [
        "catalog", "add",
        "--name", "Chicken Breast",
        "--brand", "Generic",
        "--serving-size-g", "100",
        "--protein", "31",
        "--carbs", "0",
        "--fat", "3.6",
    ])
    assert result.exit_code == 0, result.output
    data = json.loads(result.output)
    assert data["name"] == "Chicken Breast"
    assert data["brand"] == "Generic"
    assert data["protein_per_serving"] == 31.0
    assert data["id"] is not None
    # calories auto-calculated: 31*4 + 0*4 + 3.6*9 = 124 + 32.4 = 156.4
    assert abs(data["calories_per_serving"] - 156.4) < 0.01


def test_catalog_add_with_explicit_calories(runner):
    result = runner.invoke(app, [
        "catalog", "add",
        "--name", "Oats",
        "--serving-size-g", "40",
        "--protein", "5",
        "--carbs", "27",
        "--fat", "3",
        "--calories", "150",
    ])
    assert result.exit_code == 0, result.output
    data = json.loads(result.output)
    assert data["calories_per_serving"] == 150.0


def test_catalog_add_duplicate_error(runner):
    # Add first time
    args = [
        "catalog", "add",
        "--name", "Rice",
        "--brand", "Uncle Bens",
        "--serving-size-g", "45",
        "--protein", "4",
        "--carbs", "35",
        "--fat", "0.5",
    ]
    result = runner.invoke(app, args)
    assert result.exit_code == 0, result.output

    # Add duplicate
    result = runner.invoke(app, args)
    assert result.exit_code == 1
    data = json.loads(result.output)
    assert "error" in data
    assert "already exists" in data["error"]


# ---------------------------------------------------------------------------
# catalog list
# ---------------------------------------------------------------------------

def test_catalog_list_empty(runner):
    result = runner.invoke(app, ["catalog", "list"])
    assert result.exit_code == 0, result.output
    data = json.loads(result.output)
    assert data == []


def test_catalog_list_with_items(runner):
    # Add two items
    runner.invoke(app, [
        "catalog", "add",
        "--name", "Apple",
        "--serving-size-g", "182",
        "--protein", "0.5",
        "--carbs", "25",
        "--fat", "0.3",
    ])
    runner.invoke(app, [
        "catalog", "add",
        "--name", "Banana",
        "--serving-size-g", "118",
        "--protein", "1.3",
        "--carbs", "27",
        "--fat", "0.4",
    ])

    result = runner.invoke(app, ["catalog", "list"])
    assert result.exit_code == 0, result.output
    data = json.loads(result.output)
    assert len(data) == 2
    names = {entry["name"] for entry in data}
    assert names == {"Apple", "Banana"}


# ---------------------------------------------------------------------------
# catalog get
# ---------------------------------------------------------------------------

def test_catalog_get_existing(runner):
    add_result = runner.invoke(app, [
        "catalog", "add",
        "--name", "Salmon",
        "--serving-size-g", "100",
        "--protein", "25",
        "--carbs", "0",
        "--fat", "13",
    ])
    assert add_result.exit_code == 0, add_result.output
    added = json.loads(add_result.output)
    entry_id = added["id"]

    result = runner.invoke(app, ["catalog", "get", str(entry_id)])
    assert result.exit_code == 0, result.output
    data = json.loads(result.output)
    assert data["id"] == entry_id
    assert data["name"] == "Salmon"


def test_catalog_get_missing(runner):
    result = runner.invoke(app, ["catalog", "get", "9999"])
    assert result.exit_code == 1
    data = json.loads(result.output)
    assert data == {"error": "Not found"}


# ---------------------------------------------------------------------------
# catalog delete
# ---------------------------------------------------------------------------

def test_catalog_delete_existing(runner):
    add_result = runner.invoke(app, [
        "catalog", "add",
        "--name", "Tuna",
        "--serving-size-g", "85",
        "--protein", "20",
        "--carbs", "0",
        "--fat", "1",
    ])
    assert add_result.exit_code == 0, add_result.output
    added = json.loads(add_result.output)
    entry_id = added["id"]

    result = runner.invoke(app, ["catalog", "delete", str(entry_id)])
    assert result.exit_code == 0, result.output
    data = json.loads(result.output)
    assert data == {"deleted": True, "id": entry_id}

    # Verify it's gone
    get_result = runner.invoke(app, ["catalog", "get", str(entry_id)])
    assert get_result.exit_code == 1


def test_catalog_delete_missing(runner):
    result = runner.invoke(app, ["catalog", "delete", "9999"])
    assert result.exit_code == 1
    data = json.loads(result.output)
    assert data == {"error": "Not found"}
