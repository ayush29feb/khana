import json
import sys
from typing import Optional

import typer
from sqlalchemy.exc import IntegrityError

from food_tracker.db import get_session, DB_PATH
from food_tracker.models import FoodCatalog
from food_tracker.photo_utils import ingest_photo

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
        "label_photo_path": entry.label_photo_path,
        "category": entry.category,
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
    label_photo: Optional[str] = typer.Option(None, "--label-photo", help="Path to nutrition label photo (optional)"),
    category: Optional[str] = typer.Option(None, "--category", help="Category (e.g. produce, protein, dairy & eggs, grains, snacks, condiments, frozen, beverages)"),
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
        category=category,
    )

    try:
        with get_session() as session:
            session.add(entry)
            session.flush()
            if label_photo:
                entry.label_photo_path = ingest_photo(DB_PATH, label_photo, "catalog", entry.id)
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


@catalog_app.command("update")
def catalog_update(
    id: int = typer.Argument(..., help="Catalog entry ID"),
    name: Optional[str] = typer.Option(None, "--name", help="Food name"),
    brand: Optional[str] = typer.Option(None, "--brand", help="Brand name"),
    serving_size_g: Optional[float] = typer.Option(None, "--serving-size-g", help="Serving size in grams"),
    protein: Optional[float] = typer.Option(None, "--protein", help="Protein per serving (g)"),
    carbs: Optional[float] = typer.Option(None, "--carbs", help="Carbs per serving (g)"),
    fat: Optional[float] = typer.Option(None, "--fat", help="Fat per serving (g)"),
    calories: Optional[float] = typer.Option(None, "--calories", help="Calories per serving"),
    health_notes: Optional[str] = typer.Option(None, "--health-notes", help="Health notes"),
    category: Optional[str] = typer.Option(None, "--category", help="Category"),
):
    """Update fields on an existing catalog entry."""
    with get_session() as session:
        entry = session.get(FoodCatalog, id)
        if entry is None:
            typer.echo(json.dumps({"error": "Not found"}))
            raise typer.Exit(code=1)
        if name is not None:
            entry.name = name
        if brand is not None:
            entry.brand = brand
        if serving_size_g is not None:
            entry.serving_size_g = serving_size_g
        if protein is not None:
            entry.protein_per_serving = protein
        if carbs is not None:
            entry.carbs_per_serving = carbs
        if fat is not None:
            entry.fat_per_serving = fat
        if calories is not None:
            entry.calories_per_serving = calories
        if health_notes is not None:
            entry.health_notes = health_notes
        if category is not None:
            entry.category = category
        session.flush()
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
