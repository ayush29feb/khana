import json
import sys
from typing import Optional

import typer
from sqlalchemy.exc import IntegrityError

from food_tracker.db import get_session
from food_tracker.models import FoodCatalog

catalog_app = typer.Typer(help="Manage the food catalog")


def _entry_to_dict(entry: FoodCatalog) -> dict:
    return {
        "id": entry.id,
        "name": entry.name,
        "brand": entry.brand,
        "serving_size_g": entry.serving_size_g,
        "protein_per_serving": entry.protein_per_serving,
        "carbs_per_serving": entry.carbs_per_serving,
        "fat_per_serving": entry.fat_per_serving,
        "calories_per_serving": entry.calories_per_serving,
        "health_notes": entry.health_notes,
    }


@catalog_app.command("add")
def catalog_add(
    name: str = typer.Option(..., "--name", help="Food name"),
    brand: str = typer.Option("", "--brand", help="Brand name"),
    serving_size_g: float = typer.Option(..., "--serving-size-g", help="Serving size in grams"),
    protein: float = typer.Option(..., "--protein", help="Protein per serving (g)"),
    carbs: float = typer.Option(..., "--carbs", help="Carbs per serving (g)"),
    fat: float = typer.Option(..., "--fat", help="Fat per serving (g)"),
    calories: Optional[float] = typer.Option(None, "--calories", help="Calories per serving (auto-calculated if omitted)"),
    health_notes: str = typer.Option("", "--health-notes", help="Health notes"),
):
    """Add a new food to the catalog."""
    if calories is None:
        calories = protein * 4 + carbs * 4 + fat * 9

    entry = FoodCatalog(
        name=name,
        brand=brand,
        serving_size_g=serving_size_g,
        protein_per_serving=protein,
        carbs_per_serving=carbs,
        fat_per_serving=fat,
        calories_per_serving=calories,
        health_notes=health_notes,
    )

    try:
        with get_session() as session:
            session.add(entry)
            session.flush()
            result = _entry_to_dict(entry)
        typer.echo(json.dumps(result, default=str))
    except IntegrityError:
        typer.echo(json.dumps({"error": "Catalog entry with this name and brand already exists"}))
        raise typer.Exit(code=1)


@catalog_app.command("list")
def catalog_list():
    """List all catalog entries."""
    with get_session() as session:
        entries = session.query(FoodCatalog).all()
        result = [_entry_to_dict(e) for e in entries]
    typer.echo(json.dumps(result, default=str))


@catalog_app.command("get")
def catalog_get(
    id: int = typer.Argument(..., help="Catalog entry ID"),
):
    """Get a catalog entry by ID."""
    with get_session() as session:
        entry = session.get(FoodCatalog, id)
        if entry is None:
            typer.echo(json.dumps({"error": "Not found"}))
            raise typer.Exit(code=1)
        result = _entry_to_dict(entry)
    typer.echo(json.dumps(result, default=str))


@catalog_app.command("delete")
def catalog_delete(
    id: int = typer.Argument(..., help="Catalog entry ID"),
):
    """Delete a catalog entry by ID."""
    with get_session() as session:
        entry = session.get(FoodCatalog, id)
        if entry is None:
            typer.echo(json.dumps({"error": "Not found"}))
            raise typer.Exit(code=1)
        session.delete(entry)
    typer.echo(json.dumps({"deleted": True, "id": id}, default=str))
