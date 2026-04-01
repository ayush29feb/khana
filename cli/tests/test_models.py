import pytest
from datetime import datetime, date, timezone
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from food_tracker.models import (
    Base, FoodCatalog, PantryTransaction, Meal, Goal, TransactionReason
)
from food_tracker.db import PANTRY_VIEW_SQL


def make_engine():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    with engine.connect() as conn:
        for stmt in PANTRY_VIEW_SQL.split(";"):
            stmt = stmt.strip()
            if stmt:
                conn.execute(text(stmt))
        conn.commit()
    return engine


@pytest.fixture
def session():
    engine = make_engine()
    Session = sessionmaker(bind=engine)
    s = Session()
    yield s
    s.close()


def test_food_catalog_insert(session):
    item = FoodCatalog(
        name="TJ's Greek Yogurt", brand="Trader Joe's",
        serving_size_g=227.0, protein_per_serving=20.0,
        carbs_per_serving=17.0, fat_per_serving=0.0,
        calories_per_serving=130.0,
    )
    session.add(item)
    session.commit()
    assert item.id == 1
    assert item.health_notes is None


def test_food_catalog_unique_name_brand(session):
    from sqlalchemy.exc import IntegrityError
    session.add(FoodCatalog(
        name="Isopure", brand="Isopure",
        serving_size_g=30.0, protein_per_serving=25.0,
        carbs_per_serving=0.0, fat_per_serving=0.0,
        calories_per_serving=100.0,
    ))
    session.commit()
    session.add(FoodCatalog(
        name="Isopure", brand="Isopure",  # duplicate
        serving_size_g=30.0, protein_per_serving=25.0,
        carbs_per_serving=0.0, fat_per_serving=0.0,
        calories_per_serving=100.0,
    ))
    with pytest.raises(IntegrityError):
        session.commit()


def test_meal_insert(session):
    meal = Meal(
        name="Overnight oats",
        logged_at=datetime(2026, 4, 1, 8, 30, tzinfo=timezone.utc),
        protein_g=49.0, carbs_g=55.0, fat_g=8.0,
        is_estimate=False,
    )
    session.add(meal)
    session.commit()
    assert meal.id == 1
    assert meal.calories is None
    assert meal.is_estimate is False


def test_pantry_transaction_with_grocery(session):
    catalog = FoodCatalog(
        name="Isopure", brand="Isopure",
        serving_size_g=30.0, protein_per_serving=25.0,
        carbs_per_serving=0.0, fat_per_serving=0.0,
        calories_per_serving=100.0,
    )
    session.add(catalog)
    session.flush()
    tx = PantryTransaction(
        catalog_id=catalog.id,
        delta=10.0,
        reason=TransactionReason.grocery,
        meal_id=None,
        occurred_at=datetime.now(timezone.utc),
    )
    session.add(tx)
    session.commit()
    assert tx.id == 1
    assert tx.meal_id is None
    assert tx.reason == TransactionReason.grocery
    assert tx.catalog.name == "Isopure"


def test_pantry_transaction_linked_to_meal(session):
    catalog = FoodCatalog(
        name="Isopure", brand="Isopure",
        serving_size_g=30.0, protein_per_serving=25.0,
        carbs_per_serving=0.0, fat_per_serving=0.0,
        calories_per_serving=100.0,
    )
    session.add(catalog)
    session.flush()
    meal = Meal(
        name="Shake",
        logged_at=datetime.now(timezone.utc),
        protein_g=50.0, carbs_g=0.0, fat_g=0.0,
        is_estimate=False,
    )
    session.add(meal)
    session.flush()
    tx = PantryTransaction(
        catalog_id=catalog.id,
        delta=-2.0,
        reason=TransactionReason.meal,
        meal_id=meal.id,
        occurred_at=datetime.now(timezone.utc),
    )
    session.add(tx)
    session.commit()
    assert tx.meal.name == "Shake"
    assert len(meal.pantry_transactions) == 1


def test_goal_insert(session):
    goal = Goal(
        name="Cut week",
        start_date=date(2026, 4, 1),
        end_date=date(2026, 4, 7),
        protein_g=1000.0,
    )
    session.add(goal)
    session.commit()
    assert goal.id == 1
    assert goal.carbs_g is None


def test_pantry_view(session):
    catalog = FoodCatalog(
        name="Isopure", brand="Isopure",
        serving_size_g=30.0, protein_per_serving=25.0,
        carbs_per_serving=0.0, fat_per_serving=0.0,
        calories_per_serving=100.0,
    )
    session.add(catalog)
    session.flush()
    session.add(PantryTransaction(
        catalog_id=catalog.id, delta=10.0,
        reason=TransactionReason.grocery,
        occurred_at=datetime.now(timezone.utc),
    ))
    session.commit()
    row = session.execute(text("SELECT * FROM pantry")).mappings().one()
    assert row["servings_remaining"] == 10.0
    assert row["protein_available"] == 250.0  # 10 * 25g


def test_pantry_view_excludes_zero_remaining(session):
    catalog = FoodCatalog(
        name="Isopure", brand="Isopure",
        serving_size_g=30.0, protein_per_serving=25.0,
        carbs_per_serving=0.0, fat_per_serving=0.0,
        calories_per_serving=100.0,
    )
    session.add(catalog)
    session.flush()
    # Add 5 servings then remove 5 — net zero, should be excluded
    session.add(PantryTransaction(
        catalog_id=catalog.id, delta=5.0,
        reason=TransactionReason.grocery,
        occurred_at=datetime.now(timezone.utc),
    ))
    session.add(PantryTransaction(
        catalog_id=catalog.id, delta=-5.0,
        reason=TransactionReason.meal,
        occurred_at=datetime.now(timezone.utc),
    ))
    session.commit()
    rows = session.execute(text("SELECT * FROM pantry")).mappings().all()
    assert len(rows) == 0
