import json
import sys
from datetime import datetime
from typing import List, Optional

import typer

from food_tracker.db import get_session, DB_PATH
from food_tracker.models import FoodCatalog, Meal, PantryTransaction, TransactionReason
from food_tracker.photo_utils import ingest_photo

meal_app = typer.Typer(help="Log and manage meals")


def _meal_to_dict(meal: Meal, ingredients: Optional[list] = None) -> dict:
    result = {
        "id": meal.id,
        "name": meal.name,
        "logged_at": meal.logged_at.isoformat() if meal.logged_at else None,
        "protein_g": meal.protein_g,
        "carbs_g": meal.carbs_g,
        "fat_g": meal.fat_g,
        "calories": meal.calories,
        "is_estimate": meal.is_estimate,
        "notes": meal.notes,
        "photo_path": meal.photo_path,
    }
    if ingredients is not None:
        result["ingredients"] = ingredients
    return result


@meal_app.command("add-home")
def meal_add_home(
    name: str = typer.Option(..., "--name", help="Meal name"),
    ingredient: List[str] = typer.Option(..., "--ingredient", help="Format: CATALOG_ID:SERVINGS"),
    notes: Optional[str] = typer.Option(None, "--notes", help="Optional notes"),
    is_estimate: bool = typer.Option(False, "--is-estimate", is_flag=True, help="Mark as estimate"),
    logged_at: Optional[str] = typer.Option(None, "--logged-at", help="ISO timestamp (defaults to now)"),
    photo: Optional[str] = typer.Option(None, "--photo", help="Path to meal photo (optional)"),
):
    """Log a home-cooked meal using pantry items."""
    # Parse logged_at
    if logged_at:
        meal_time = datetime.fromisoformat(logged_at)
    else:
        meal_time = datetime.now()

    # Parse ingredients
    parsed_ingredients = []
    for ing in ingredient:
        parts = ing.split(":")
        if len(parts) != 2:
            typer.echo(json.dumps({"error": f"Invalid ingredient format: {ing}"}))
            raise typer.Exit(code=1)
        try:
            catalog_id = int(parts[0])
            servings = float(parts[1])
        except ValueError:
            typer.echo(json.dumps({"error": f"Invalid ingredient format: {ing}"}))
            raise typer.Exit(code=1)
        parsed_ingredients.append((catalog_id, servings))

    with get_session() as session:
        # Look up catalog entries
        catalog_entries = []
        for catalog_id, servings in parsed_ingredients:
            entry = session.get(FoodCatalog, catalog_id)
            if entry is None:
                typer.echo(json.dumps({"error": f"Catalog entry not found: {catalog_id}"}))
                raise typer.Exit(code=1)
            catalog_entries.append((entry, servings))

        # Compute totals
        total_protein = sum(e.protein_per_serving * s for e, s in catalog_entries)
        total_carbs = sum(e.carbs_per_serving * s for e, s in catalog_entries)
        total_fat = sum(e.fat_per_serving * s for e, s in catalog_entries)
        total_calories = sum(e.calories_per_serving * s for e, s in catalog_entries)

        # Create meal
        meal = Meal(
            name=name,
            protein_g=total_protein,
            carbs_g=total_carbs,
            fat_g=total_fat,
            calories=total_calories,
            is_estimate=is_estimate,
            notes=notes,
            logged_at=meal_time,
        )
        session.add(meal)
        session.flush()

        # Ingest photo if provided
        if photo:
            meal.photo_path = ingest_photo(DB_PATH, photo, "meals", meal.id)

        # Create pantry transactions
        for entry, servings in catalog_entries:
            txn = PantryTransaction(
                catalog_id=entry.id,
                delta=-servings,
                reason=TransactionReason.meal,
                meal_id=meal.id,
                occurred_at=meal_time,
            )
            session.add(txn)

        session.flush()

        ingredients_list = [
            {"catalog_id": entry.id, "servings": servings}
            for entry, servings in catalog_entries
        ]
        result = _meal_to_dict(meal, ingredients=ingredients_list)

    typer.echo(json.dumps(result, default=str))


@meal_app.command("add-restaurant")
def meal_add_restaurant(
    name: str = typer.Option(..., "--name", help="Meal name"),
    protein: float = typer.Option(..., "--protein", help="Protein (g)"),
    carbs: float = typer.Option(..., "--carbs", help="Carbs (g)"),
    fat: float = typer.Option(..., "--fat", help="Fat (g)"),
    calories: Optional[float] = typer.Option(None, "--calories", help="Calories (optional)"),
    notes: Optional[str] = typer.Option(None, "--notes", help="Optional notes"),
    is_estimate: bool = typer.Option(False, "--is-estimate", is_flag=True, help="Mark as estimate"),
    logged_at: Optional[str] = typer.Option(None, "--logged-at", help="ISO timestamp (defaults to now)"),
    photo: Optional[str] = typer.Option(None, "--photo", help="Path to meal photo (optional)"),
):
    """Log a restaurant meal (no pantry deduction)."""
    if logged_at:
        meal_time = datetime.fromisoformat(logged_at)
    else:
        meal_time = datetime.now()

    meal = Meal(
        name=name,
        protein_g=protein,
        carbs_g=carbs,
        fat_g=fat,
        calories=calories,
        is_estimate=is_estimate,
        notes=notes,
        logged_at=meal_time,
    )

    with get_session() as session:
        session.add(meal)
        session.flush()
        if photo:
            meal.photo_path = ingest_photo(DB_PATH, photo, "meals", meal.id)
        result = _meal_to_dict(meal, ingredients=[])

    typer.echo(json.dumps(result, default=str))


@meal_app.command("list")
def meal_list(
    date: Optional[str] = typer.Option(None, "--date", help="Filter by date (YYYY-MM-DD)"),
    limit: int = typer.Option(20, "--limit", help="Max results"),
):
    """List meals, ordered by logged_at DESC."""
    with get_session() as session:
        query = session.query(Meal)
        if date:
            try:
                filter_date = datetime.strptime(date, "%Y-%m-%d").date()
            except ValueError:
                typer.echo(json.dumps({"error": f"Invalid date format: {date}"}))
                raise typer.Exit(code=1)
            from sqlalchemy import func
            query = query.filter(func.date(Meal.logged_at) == filter_date.isoformat())
        query = query.order_by(Meal.logged_at.desc()).limit(limit)
        meals = query.all()
        result = [_meal_to_dict(m) for m in meals]

    typer.echo(json.dumps(result, default=str))


@meal_app.command("delete")
def meal_delete(
    id: int = typer.Argument(..., help="Meal ID"),
):
    """Delete a meal by ID, also removing linked pantry transactions."""
    with get_session() as session:
        meal = session.get(Meal, id)
        if meal is None:
            typer.echo(json.dumps({"error": "Not found"}))
            raise typer.Exit(code=1)

        # Manually delete linked PantryTransactions first (no cascade)
        for txn in list(meal.pantry_transactions):
            session.delete(txn)

        session.delete(meal)

    typer.echo(json.dumps({"deleted": True, "id": id}, default=str))
