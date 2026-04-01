import typer

from food_tracker.commands.catalog import catalog_app
from food_tracker.commands.meal import meal_app
from food_tracker.commands.pantry import pantry_app

app = typer.Typer(name="food", help="Food tracker CLI")

goal_app = typer.Typer(help="Manage nutrition goals")

app.add_typer(catalog_app, name="catalog")
app.add_typer(pantry_app, name="pantry")
app.add_typer(meal_app, name="meal")
app.add_typer(goal_app, name="goal")

if __name__ == "__main__":
    app()
