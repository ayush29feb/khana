import pytest
from datetime import datetime, date, timezone
from sqlalchemy import text
from food_tracker.models import (
    Base, FoodCatalog, PantryTransaction, Meal, Goal, TransactionReason
)


def test_food_catalog_insert(db_session):
    item = FoodCatalog(
        name="TJ's Greek Yogurt", brand="Trader Joe's",
        serving_size_g=227.0, protein_per_serving=20.0,
        carbs_per_serving=17.0, fat_per_serving=0.0,
        calories_per_serving=130.0,
    )
    db_session.add(item)
    db_session.commit()
    assert item.id == 1
    assert item.health_notes is None


def test_food_catalog_unique_name_brand(db_session):
    from sqlalchemy.exc import IntegrityError
    db_session.add(FoodCatalog(
        name="Isopure", brand="Isopure",
        serving_size_g=30.0, protein_per_serving=25.0,
        carbs_per_serving=0.0, fat_per_serving=0.0,
        calories_per_serving=100.0,
    ))
    db_session.commit()
    db_session.add(FoodCatalog(
        name="Isopure", brand="Isopure",  # duplicate
        serving_size_g=30.0, protein_per_serving=25.0,
        carbs_per_serving=0.0, fat_per_serving=0.0,
        calories_per_serving=100.0,
    ))
    with pytest.raises(IntegrityError):
        db_session.commit()


def test_meal_insert(db_session):
    meal = Meal(
        name="Overnight oats",
        logged_at=datetime(2026, 4, 1, 8, 30, tzinfo=timezone.utc),
        protein_g=49.0, carbs_g=55.0, fat_g=8.0,
        is_estimate=False,
    )
    db_session.add(meal)
    db_session.commit()
    assert meal.id == 1
    assert meal.calories is None
    assert meal.is_estimate is False


def test_pantry_transaction_with_grocery(db_session):
    catalog = FoodCatalog(
        name="Isopure", brand="Isopure",
        serving_size_g=30.0, protein_per_serving=25.0,
        carbs_per_serving=0.0, fat_per_serving=0.0,
        calories_per_serving=100.0,
    )
    db_session.add(catalog)
    db_session.flush()
    tx = PantryTransaction(
        catalog_id=catalog.id,
        delta=10.0,
        reason=TransactionReason.grocery,
        meal_id=None,
        occurred_at=datetime.now(timezone.utc),
    )
    db_session.add(tx)
    db_session.commit()
    assert tx.id == 1
    assert tx.meal_id is None
    assert tx.reason == TransactionReason.grocery
    assert tx.catalog.name == "Isopure"


def test_pantry_transaction_linked_to_meal(db_session):
    catalog = FoodCatalog(
        name="Isopure", brand="Isopure",
        serving_size_g=30.0, protein_per_serving=25.0,
        carbs_per_serving=0.0, fat_per_serving=0.0,
        calories_per_serving=100.0,
    )
    db_session.add(catalog)
    db_session.flush()
    meal = Meal(
        name="Shake",
        logged_at=datetime.now(timezone.utc),
        protein_g=50.0, carbs_g=0.0, fat_g=0.0,
        is_estimate=False,
    )
    db_session.add(meal)
    db_session.flush()
    tx = PantryTransaction(
        catalog_id=catalog.id,
        delta=-2.0,
        reason=TransactionReason.meal,
        meal_id=meal.id,
        occurred_at=datetime.now(timezone.utc),
    )
    db_session.add(tx)
    db_session.commit()
    assert tx.meal.name == "Shake"
    assert len(meal.pantry_transactions) == 1


def test_goal_insert(db_session):
    goal = Goal(
        name="Cut week",
        start_date=date(2026, 4, 1),
        end_date=date(2026, 4, 7),
        protein_g=1000.0,
    )
    db_session.add(goal)
    db_session.commit()
    assert goal.id == 1
    assert goal.carbs_g is None


def test_pantry_view(db_session):
    catalog = FoodCatalog(
        name="Isopure", brand="Isopure",
        serving_size_g=30.0, protein_per_serving=25.0,
        carbs_per_serving=0.0, fat_per_serving=0.0,
        calories_per_serving=100.0,
    )
    db_session.add(catalog)
    db_session.flush()
    db_session.add(PantryTransaction(
        catalog_id=catalog.id, delta=10.0,
        reason=TransactionReason.grocery,
        occurred_at=datetime.now(timezone.utc),
    ))
    db_session.commit()
    row = db_session.execute(text("SELECT * FROM pantry")).mappings().one()
    assert row["servings_remaining"] == 10.0
    assert row["protein_available"] == 250.0  # 10 * 25g


def test_pantry_view_excludes_zero_remaining(db_session):
    catalog = FoodCatalog(
        name="Isopure", brand="Isopure",
        serving_size_g=30.0, protein_per_serving=25.0,
        carbs_per_serving=0.0, fat_per_serving=0.0,
        calories_per_serving=100.0,
    )
    db_session.add(catalog)
    db_session.flush()
    # Add 5 servings then remove 5 — net zero, should be excluded
    db_session.add(PantryTransaction(
        catalog_id=catalog.id, delta=5.0,
        reason=TransactionReason.grocery,
        occurred_at=datetime.now(timezone.utc),
    ))
    db_session.add(PantryTransaction(
        catalog_id=catalog.id, delta=-5.0,
        reason=TransactionReason.meal,
        occurred_at=datetime.now(timezone.utc),
    ))
    db_session.commit()
    rows = db_session.execute(text("SELECT * FROM pantry")).mappings().all()
    assert len(rows) == 0
