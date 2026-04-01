import typer

app = typer.Typer(name="food", help="Food tracker CLI")

catalog_app = typer.Typer(help="Manage the food catalog")
pantry_app = typer.Typer(help="Manage pantry inventory")
meal_app = typer.Typer(help="Log and manage meals")
goal_app = typer.Typer(help="Manage nutrition goals")

app.add_typer(catalog_app, name="catalog")
app.add_typer(pantry_app, name="pantry")
app.add_typer(meal_app, name="meal")
app.add_typer(goal_app, name="goal")

if __name__ == "__main__":
    app()
