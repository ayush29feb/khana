from enum import Enum
from sqlalchemy import (
    Column, Integer, Float, String, Boolean, DateTime, Date,
    ForeignKey, Enum as SAEnum, Index, UniqueConstraint,
)
from sqlalchemy.orm import DeclarativeBase, relationship


class Base(DeclarativeBase):
    pass


class FoodCatalog(Base):
    __tablename__ = "food_catalog"
    __table_args__ = (UniqueConstraint("name", "brand", name="uq_catalog_name_brand"),)

    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    brand = Column(String, nullable=True)
    serving_size_g = Column(Float, nullable=False)
    protein_per_serving = Column(Float, nullable=False)
    carbs_per_serving = Column(Float, nullable=False)
    fat_per_serving = Column(Float, nullable=False)
    calories_per_serving = Column(Float, nullable=False)
    health_notes = Column(String, nullable=True)
    label_photo_path = Column(String, nullable=True)
    category = Column(String, nullable=True)


class TransactionReason(str, Enum):
    grocery = "grocery"
    meal = "meal"
    expired = "expired"
    manual = "manual"


class Meal(Base):
    __tablename__ = "meals"
    __table_args__ = (Index("idx_meals_logged_at", "logged_at"),)

    id = Column(Integer, primary_key=True)
    logged_at = Column(DateTime, nullable=False)
    name = Column(String, nullable=False)
    protein_g = Column(Float, nullable=False)
    carbs_g = Column(Float, nullable=False)
    fat_g = Column(Float, nullable=False)
    calories = Column(Float, nullable=True)
    is_estimate = Column(Boolean, nullable=False, default=False)
    notes = Column(String, nullable=True)
    photo_path = Column(String, nullable=True)

    pantry_transactions = relationship(
        "PantryTransaction",
        back_populates="meal",
        foreign_keys="PantryTransaction.meal_id",
    )


class PantryTransaction(Base):
    __tablename__ = "pantry_transactions"
    __table_args__ = (Index("idx_pantry_catalog_id", "catalog_id"),)

    id = Column(Integer, primary_key=True)
    catalog_id = Column(Integer, ForeignKey("food_catalog.id"), nullable=False)
    delta = Column(Float, nullable=False)
    reason = Column(SAEnum(TransactionReason), nullable=False)
    meal_id = Column(Integer, ForeignKey("meals.id"), nullable=True)
    occurred_at = Column(DateTime, nullable=False)

    catalog = relationship("FoodCatalog")
    meal = relationship("Meal", back_populates="pantry_transactions", foreign_keys=[meal_id])


class Goal(Base):
    __tablename__ = "goals"

    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    protein_g = Column(Float, nullable=True)
    carbs_g = Column(Float, nullable=True)
    fat_g = Column(Float, nullable=True)
    calories = Column(Float, nullable=True)
