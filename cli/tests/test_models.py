from food_tracker.models import Base, FoodCatalog, PantryTransaction, Meal, Goal, TransactionReason
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

def test_models_create_tables():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    Session = sessionmaker(bind=engine)
    with Session() as s:
        item = FoodCatalog(
            name="Test Yogurt", brand="Test Brand",
            serving_size_g=227.0, protein_per_serving=20.0,
            carbs_per_serving=17.0, fat_per_serving=0.0,
            calories_per_serving=130.0,
        )
        s.add(item)
        s.commit()
        assert item.id == 1
        assert item.health_notes is None
