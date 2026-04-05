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
from food_tracker.models import Base, PantryTransaction


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


def _add_catalog_entry(runner, name="Chicken", protein=30.0, carbs=0.0, fat=3.0, calories=150.0):
    """Helper to add a catalog entry and return its ID."""
    result = runner.invoke(app, [
        "catalog", "add",
        "--name", name,
        "--serving-size-g", "100",
        "--protein", str(protein),
        "--carbs", str(carbs),
        "--fat", str(fat),
        "--calories", str(calories),
    ])
    assert result.exit_code == 0, result.output
    return json.loads(result.output)["id"]


# ---------------------------------------------------------------------------
# meal add-home
# ---------------------------------------------------------------------------

def test_meal_add_home_success(runner, isolated_db):
    """Add-home logs meal and creates pantry deduction transactions."""
    cat_id1 = _add_catalog_entry(runner, name="Chicken", protein=30.0, carbs=0.0, fat=3.0, calories=150.0)
    cat_id2 = _add_catalog_entry(runner, name="Rice", protein=4.0, carbs=35.0, fat=0.5, calories=160.0)

    result = runner.invoke(app, [
        "meal", "add-home",
        "--name", "Chicken and Rice",
        "--ingredient", f"{cat_id1}:2",
        "--ingredient", f"{cat_id2}:1.5",
        "--notes", "Post workout",
    ])
    assert result.exit_code == 0, result.output
    data = json.loads(result.output)

    assert data["name"] == "Chicken and Rice"
    assert data["notes"] == "Post workout"
    assert data["is_estimate"] is False
    assert data["id"] is not None
    # protein: 30*2 + 4*1.5 = 60 + 6 = 66
    assert abs(data["protein_g"] - 66.0) < 0.01
    # carbs: 0*2 + 35*1.5 = 52.5
    assert abs(data["carbs_g"] - 52.5) < 0.01
    # fat: 3*2 + 0.5*1.5 = 6.75
    assert abs(data["fat_g"] - 6.75) < 0.01
    # calories: 150*2 + 160*1.5 = 300 + 240 = 540
    assert abs(data["calories"] - 540.0) < 0.01
    assert len(data["ingredients"]) == 2

    # Verify pantry transactions were created with negative deltas
    Session = sessionmaker(bind=isolated_db)
    session = Session()
    txns = session.query(PantryTransaction).filter_by(meal_id=data["id"]).all()
    session.close()

    assert len(txns) == 2
    deltas = {txn.catalog_id: txn.delta for txn in txns}
    assert abs(deltas[cat_id1] - (-2.0)) < 0.01
    assert abs(deltas[cat_id2] - (-1.5)) < 0.01


def test_meal_add_home_bad_ingredient_format(runner):
    """Invalid ingredient format should error with exit code 1."""
    result = runner.invoke(app, [
        "meal", "add-home",
        "--name", "Bad Meal",
        "--ingredient", "not-valid-format",
    ])
    assert result.exit_code == 1
    data = json.loads(result.output)
    assert "error" in data


def test_meal_add_home_unknown_catalog_id(runner):
    """Unknown catalog ID should return error and exit 1."""
    result = runner.invoke(app, [
        "meal", "add-home",
        "--name", "Ghost Meal",
        "--ingredient", "9999:1",
    ])
    assert result.exit_code == 1
    data = json.loads(result.output)
    assert "error" in data
    assert "9999" in data["error"]


def test_meal_add_home_is_estimate_flag(runner):
    """is_estimate flag should be recorded correctly."""
    cat_id = _add_catalog_entry(runner, name="Egg", protein=6.0, carbs=0.5, fat=5.0, calories=70.0)
    result = runner.invoke(app, [
        "meal", "add-home",
        "--name", "Scrambled Eggs",
        "--ingredient", f"{cat_id}:2",
        "--is-estimate",
    ])
    assert result.exit_code == 0, result.output
    data = json.loads(result.output)
    assert data["is_estimate"] is True


# ---------------------------------------------------------------------------
# meal add-restaurant
# ---------------------------------------------------------------------------

def test_meal_add_restaurant_success(runner):
    """Add-restaurant creates a meal with no pantry transactions."""
    result = runner.invoke(app, [
        "meal", "add-restaurant",
        "--name", "Burger",
        "--protein", "25",
        "--carbs", "45",
        "--fat", "20",
        "--calories", "460",
        "--notes", "Cheat day",
        "--is-estimate",
    ])
    assert result.exit_code == 0, result.output
    data = json.loads(result.output)

    assert data["name"] == "Burger"
    assert data["protein_g"] == 25.0
    assert data["carbs_g"] == 45.0
    assert data["fat_g"] == 20.0
    assert data["calories"] == 460.0
    assert data["notes"] == "Cheat day"
    assert data["is_estimate"] is True
    assert data["id"] is not None
    # ingredients should be empty (no pantry deduction)
    assert data.get("ingredients", []) == []


def test_meal_add_restaurant_no_calories(runner):
    """Calories can be omitted for restaurant meal."""
    result = runner.invoke(app, [
        "meal", "add-restaurant",
        "--name", "Salad",
        "--protein", "10",
        "--carbs", "15",
        "--fat", "5",
    ])
    assert result.exit_code == 0, result.output
    data = json.loads(result.output)
    assert data["name"] == "Salad"
    # calories can be None or auto-set — just verify the meal was created
    assert data["id"] is not None


# ---------------------------------------------------------------------------
# meal list
# ---------------------------------------------------------------------------

def test_meal_list_empty(runner):
    """Listing meals on empty DB returns empty array."""
    result = runner.invoke(app, ["meal", "list"])
    assert result.exit_code == 0, result.output
    data = json.loads(result.output)
    assert data == []


def test_meal_list_with_items(runner):
    """Listed meals are ordered by logged_at DESC."""
    runner.invoke(app, [
        "meal", "add-restaurant",
        "--name", "Breakfast",
        "--protein", "15",
        "--carbs", "30",
        "--fat", "10",
        "--logged-at", "2026-04-01T08:00:00",
    ])
    runner.invoke(app, [
        "meal", "add-restaurant",
        "--name", "Lunch",
        "--protein", "35",
        "--carbs", "50",
        "--fat", "15",
        "--logged-at", "2026-04-01T12:00:00",
    ])

    result = runner.invoke(app, ["meal", "list"])
    assert result.exit_code == 0, result.output
    data = json.loads(result.output)
    assert len(data) == 2
    # Should be in DESC order
    assert data[0]["name"] == "Lunch"
    assert data[1]["name"] == "Breakfast"


def test_meal_list_filtered_by_date(runner):
    """--date filter returns only meals from that day."""
    runner.invoke(app, [
        "meal", "add-restaurant",
        "--name", "Yesterday Dinner",
        "--protein", "30",
        "--carbs", "40",
        "--fat", "12",
        "--logged-at", "2026-03-31T19:00:00",
    ])
    runner.invoke(app, [
        "meal", "add-restaurant",
        "--name", "Today Lunch",
        "--protein", "35",
        "--carbs", "50",
        "--fat", "15",
        "--logged-at", "2026-04-01T12:00:00",
    ])
    runner.invoke(app, [
        "meal", "add-restaurant",
        "--name", "Today Breakfast",
        "--protein", "15",
        "--carbs", "30",
        "--fat", "8",
        "--logged-at", "2026-04-01T08:00:00",
    ])

    result = runner.invoke(app, ["meal", "list", "--date", "2026-04-01"])
    assert result.exit_code == 0, result.output
    data = json.loads(result.output)
    assert len(data) == 2
    names = {m["name"] for m in data}
    assert names == {"Today Lunch", "Today Breakfast"}


def test_meal_list_limit(runner):
    """--limit caps the number of results."""
    for i in range(5):
        runner.invoke(app, [
            "meal", "add-restaurant",
            "--name", f"Meal {i}",
            "--protein", "20",
            "--carbs", "30",
            "--fat", "10",
        ])

    result = runner.invoke(app, ["meal", "list", "--limit", "3"])
    assert result.exit_code == 0, result.output
    data = json.loads(result.output)
    assert len(data) == 3


# ---------------------------------------------------------------------------
# meal delete
# ---------------------------------------------------------------------------

def test_meal_delete_success(runner, isolated_db):
    """Delete removes the meal and its pantry transactions."""
    cat_id = _add_catalog_entry(runner, name="Oats", protein=5.0, carbs=27.0, fat=3.0, calories=150.0)
    add_result = runner.invoke(app, [
        "meal", "add-home",
        "--name", "Oatmeal",
        "--ingredient", f"{cat_id}:1",
    ])
    assert add_result.exit_code == 0, add_result.output
    meal_id = json.loads(add_result.output)["id"]

    # Verify transaction exists
    Session = sessionmaker(bind=isolated_db)
    session = Session()
    txns_before = session.query(PantryTransaction).filter_by(meal_id=meal_id).all()
    session.close()
    assert len(txns_before) == 1

    # Delete the meal
    del_result = runner.invoke(app, ["meal", "delete", str(meal_id)])
    assert del_result.exit_code == 0, del_result.output
    data = json.loads(del_result.output)
    assert data == {"deleted": True, "id": meal_id}

    # Verify transactions are also gone
    Session2 = sessionmaker(bind=isolated_db)
    session2 = Session2()
    txns_after = session2.query(PantryTransaction).filter_by(meal_id=meal_id).all()
    session2.close()
    assert len(txns_after) == 0


def test_meal_delete_missing(runner):
    """Deleting non-existent meal returns error and exit 1."""
    result = runner.invoke(app, ["meal", "delete", "9999"])
    assert result.exit_code == 1
    data = json.loads(result.output)
    assert "error" in data
