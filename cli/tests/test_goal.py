import datetime
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
from food_tracker.models import Base, Meal


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
# Helper to add a goal
# ---------------------------------------------------------------------------

def add_goal(runner, name="Test Goal", start_date="2026-01-01", end_date="2026-01-31",
             protein=150.0, carbs=None, fat=None, calories=None):
    args = [
        "goal", "add",
        "--name", name,
        "--start-date", start_date,
        "--end-date", end_date,
    ]
    if protein is not None:
        args += ["--protein", str(protein)]
    if carbs is not None:
        args += ["--carbs", str(carbs)]
    if fat is not None:
        args += ["--fat", str(fat)]
    if calories is not None:
        args += ["--calories", str(calories)]
    return runner.invoke(app, args)


# ---------------------------------------------------------------------------
# goal add
# ---------------------------------------------------------------------------

def test_goal_add_success(runner):
    result = add_goal(runner, protein=150.0, carbs=200.0, fat=60.0, calories=1950.0)
    assert result.exit_code == 0, result.output
    data = json.loads(result.output)
    assert data["name"] == "Test Goal"
    assert data["start_date"] == "2026-01-01"
    assert data["end_date"] == "2026-01-31"
    assert data["protein_g"] == 150.0
    assert data["carbs_g"] == 200.0
    assert data["fat_g"] == 60.0
    assert data["calories"] == 1950.0
    assert data["id"] is not None


def test_goal_add_partial_nutrients(runner):
    """Only protein specified — should succeed."""
    result = add_goal(runner, protein=150.0, carbs=None, fat=None, calories=None)
    assert result.exit_code == 0, result.output
    data = json.loads(result.output)
    assert data["protein_g"] == 150.0
    assert data["carbs_g"] is None
    assert data["fat_g"] is None
    assert data["calories"] is None


def test_goal_add_bad_dates(runner):
    """start_date after end_date should fail."""
    result = add_goal(runner, start_date="2026-02-01", end_date="2026-01-01")
    assert result.exit_code == 1
    data = json.loads(result.output)
    assert data == {"error": "start_date must be before end_date"}


def test_goal_add_same_start_end_date(runner):
    """start_date == end_date should succeed."""
    result = add_goal(runner, start_date="2026-01-15", end_date="2026-01-15")
    assert result.exit_code == 0, result.output
    data = json.loads(result.output)
    assert data["start_date"] == "2026-01-15"
    assert data["end_date"] == "2026-01-15"


def test_goal_add_no_nutrients(runner):
    """No nutrient targets should fail."""
    result = add_goal(runner, protein=None, carbs=None, fat=None, calories=None)
    assert result.exit_code == 1
    data = json.loads(result.output)
    assert data == {"error": "At least one nutrient target required"}


# ---------------------------------------------------------------------------
# goal list
# ---------------------------------------------------------------------------

def test_goal_list_empty(runner):
    result = runner.invoke(app, ["goal", "list"])
    assert result.exit_code == 0, result.output
    data = json.loads(result.output)
    assert data == []


def test_goal_list_all(runner):
    add_goal(runner, name="Goal A", start_date="2026-01-01", end_date="2026-01-31")
    add_goal(runner, name="Goal B", start_date="2026-02-01", end_date="2026-02-28")
    result = runner.invoke(app, ["goal", "list"])
    assert result.exit_code == 0, result.output
    data = json.loads(result.output)
    assert len(data) == 2
    # Ordered by start_date DESC: Goal B first
    assert data[0]["name"] == "Goal B"
    assert data[1]["name"] == "Goal A"


def test_goal_list_active(runner):
    # Today is 2026-04-01 per context
    add_goal(runner, name="Past Goal", start_date="2026-01-01", end_date="2026-02-28")
    add_goal(runner, name="Active Goal", start_date="2026-03-01", end_date="2026-04-30")
    add_goal(runner, name="Future Goal", start_date="2026-05-01", end_date="2026-05-31")

    result = runner.invoke(app, ["goal", "list", "--active"])
    assert result.exit_code == 0, result.output
    data = json.loads(result.output)
    assert len(data) == 1
    assert data[0]["name"] == "Active Goal"


# ---------------------------------------------------------------------------
# goal get
# ---------------------------------------------------------------------------

def test_goal_get_existing(runner):
    add_result = add_goal(runner, name="My Goal")
    assert add_result.exit_code == 0, add_result.output
    goal_id = json.loads(add_result.output)["id"]

    result = runner.invoke(app, ["goal", "get", str(goal_id)])
    assert result.exit_code == 0, result.output
    data = json.loads(result.output)
    assert data["id"] == goal_id
    assert data["name"] == "My Goal"


def test_goal_get_missing(runner):
    result = runner.invoke(app, ["goal", "get", "9999"])
    assert result.exit_code == 1
    data = json.loads(result.output)
    assert data == {"error": "Not found"}


# ---------------------------------------------------------------------------
# goal progress
# ---------------------------------------------------------------------------

def test_goal_progress_no_meals(runner):
    add_result = add_goal(runner, protein=150.0, carbs=200.0, fat=60.0, calories=1950.0)
    assert add_result.exit_code == 0, add_result.output
    goal_id = json.loads(add_result.output)["id"]

    result = runner.invoke(app, ["goal", "progress", str(goal_id)])
    assert result.exit_code == 0, result.output
    data = json.loads(result.output)

    assert data["goal"]["id"] == goal_id
    assert data["actual"]["protein_g"] == 0.0
    assert data["actual"]["carbs_g"] == 0.0
    assert data["actual"]["fat_g"] == 0.0
    assert data["actual"]["calories"] == 0.0
    assert data["remaining"]["protein_g"] == 150.0
    assert data["remaining"]["carbs_g"] == 200.0
    assert data["remaining"]["fat_g"] == 60.0
    assert data["remaining"]["calories"] == 1950.0


def test_goal_progress_with_meals(runner, isolated_db):
    add_result = add_goal(
        runner,
        start_date="2026-01-01", end_date="2026-01-31",
        protein=150.0, carbs=200.0, fat=60.0, calories=1950.0
    )
    assert add_result.exit_code == 0, add_result.output
    goal_id = json.loads(add_result.output)["id"]

    # Insert meals directly into the DB within the goal's date range
    Session = sessionmaker(bind=isolated_db)
    session = Session()
    meal1 = Meal(
        name="Breakfast",
        logged_at=datetime.datetime(2026, 1, 10, 8, 0, 0),
        protein_g=40.0,
        carbs_g=60.0,
        fat_g=15.0,
        calories=535.0,
        is_estimate=False,
    )
    meal2 = Meal(
        name="Lunch",
        logged_at=datetime.datetime(2026, 1, 15, 12, 0, 0),
        protein_g=50.0,
        carbs_g=70.0,
        fat_g=20.0,
        calories=660.0,
        is_estimate=False,
    )
    session.add(meal1)
    session.add(meal2)
    session.commit()
    session.close()

    result = runner.invoke(app, ["goal", "progress", str(goal_id)])
    assert result.exit_code == 0, result.output
    data = json.loads(result.output)

    assert data["actual"]["protein_g"] == 90.0
    assert data["actual"]["carbs_g"] == 130.0
    assert data["actual"]["fat_g"] == 35.0
    assert data["actual"]["calories"] == 1195.0

    assert data["remaining"]["protein_g"] == 60.0
    assert data["remaining"]["carbs_g"] == 70.0
    assert data["remaining"]["fat_g"] == 25.0
    assert data["remaining"]["calories"] == 755.0


def test_goal_progress_null_targets(runner, isolated_db):
    """Remaining should be null for nutrients not in the goal."""
    add_result = add_goal(runner, protein=150.0, carbs=None, fat=None, calories=None)
    assert add_result.exit_code == 0, add_result.output
    goal_id = json.loads(add_result.output)["id"]

    result = runner.invoke(app, ["goal", "progress", str(goal_id)])
    assert result.exit_code == 0, result.output
    data = json.loads(result.output)

    assert data["remaining"]["protein_g"] == 150.0
    assert data["remaining"]["carbs_g"] is None
    assert data["remaining"]["fat_g"] is None
    assert data["remaining"]["calories"] is None


def test_goal_progress_meals_outside_range(runner, isolated_db):
    """Meals outside the goal date range should not count."""
    add_result = add_goal(
        runner,
        start_date="2026-01-01", end_date="2026-01-31",
        protein=150.0, carbs=None, fat=None, calories=None
    )
    assert add_result.exit_code == 0, add_result.output
    goal_id = json.loads(add_result.output)["id"]

    Session = sessionmaker(bind=isolated_db)
    session = Session()
    outside_meal = Meal(
        name="Outside meal",
        logged_at=datetime.datetime(2026, 2, 5, 12, 0, 0),
        protein_g=100.0,
        carbs_g=50.0,
        fat_g=30.0,
        calories=870.0,
        is_estimate=False,
    )
    session.add(outside_meal)
    session.commit()
    session.close()

    result = runner.invoke(app, ["goal", "progress", str(goal_id)])
    assert result.exit_code == 0, result.output
    data = json.loads(result.output)

    assert data["actual"]["protein_g"] == 0.0
    assert data["remaining"]["protein_g"] == 150.0


def test_goal_progress_missing(runner):
    result = runner.invoke(app, ["goal", "progress", "9999"])
    assert result.exit_code == 1
    data = json.loads(result.output)
    assert data == {"error": "Not found"}


# ---------------------------------------------------------------------------
# goal delete
# ---------------------------------------------------------------------------

def test_goal_delete_existing(runner):
    add_result = add_goal(runner)
    assert add_result.exit_code == 0, add_result.output
    goal_id = json.loads(add_result.output)["id"]

    result = runner.invoke(app, ["goal", "delete", str(goal_id)])
    assert result.exit_code == 0, result.output
    data = json.loads(result.output)
    assert data == {"deleted": True, "id": goal_id}

    # Verify gone
    get_result = runner.invoke(app, ["goal", "get", str(goal_id)])
    assert get_result.exit_code == 1


def test_goal_delete_missing(runner):
    result = runner.invoke(app, ["goal", "delete", "9999"])
    assert result.exit_code == 1
    data = json.loads(result.output)
    assert data == {"error": "Not found"}
