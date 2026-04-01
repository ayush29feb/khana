import datetime
import json
from typing import Optional

import typer
from sqlalchemy import func

from food_tracker.db import get_session
from food_tracker.models import Goal, Meal

goal_app = typer.Typer(help="Manage nutrition goals")


def _goal_to_dict(goal: Goal) -> dict:
    return {
        "id": goal.id,
        "name": goal.name,
        "start_date": goal.start_date.isoformat(),
        "end_date": goal.end_date.isoformat(),
        "protein_g": goal.protein_g,
        "carbs_g": goal.carbs_g,
        "fat_g": goal.fat_g,
        "calories": goal.calories,
    }


@goal_app.command("add")
def goal_add(
    name: str = typer.Option(..., "--name", help="Goal name"),
    start_date: str = typer.Option(..., "--start-date", help="Start date (YYYY-MM-DD)"),
    end_date: str = typer.Option(..., "--end-date", help="End date (YYYY-MM-DD)"),
    protein: Optional[float] = typer.Option(None, "--protein", help="Protein target (g)"),
    carbs: Optional[float] = typer.Option(None, "--carbs", help="Carbs target (g)"),
    fat: Optional[float] = typer.Option(None, "--fat", help="Fat target (g)"),
    calories: Optional[float] = typer.Option(None, "--calories", help="Calories target"),
):
    """Add a new nutrition goal."""
    try:
        start = datetime.date.fromisoformat(start_date)
        end = datetime.date.fromisoformat(end_date)
    except ValueError as e:
        typer.echo(json.dumps({"error": f"Invalid date format: {e}"}))
        raise typer.Exit(code=1)

    if start > end:
        typer.echo(json.dumps({"error": "start_date must be before end_date"}))
        raise typer.Exit(code=1)

    if protein is None and carbs is None and fat is None and calories is None:
        typer.echo(json.dumps({"error": "At least one nutrient target required"}))
        raise typer.Exit(code=1)

    goal = Goal(
        name=name,
        start_date=start,
        end_date=end,
        protein_g=protein,
        carbs_g=carbs,
        fat_g=fat,
        calories=calories,
    )

    with get_session() as session:
        session.add(goal)
        session.flush()
        result = _goal_to_dict(goal)

    typer.echo(json.dumps(result, default=str))


@goal_app.command("list")
def goal_list(
    active: bool = typer.Option(False, "--active", is_flag=True, help="Only show currently active goals"),
):
    """List all goals ordered by start_date DESC."""
    with get_session() as session:
        query = session.query(Goal)
        if active:
            today = datetime.date.today()
            query = query.filter(Goal.start_date <= today, Goal.end_date >= today)
        query = query.order_by(Goal.start_date.desc())
        goals = query.all()
        result = [_goal_to_dict(g) for g in goals]

    typer.echo(json.dumps(result, default=str))


@goal_app.command("get")
def goal_get(
    id: int = typer.Argument(..., help="Goal ID"),
):
    """Get a goal by ID."""
    with get_session() as session:
        goal = session.get(Goal, id)
        if goal is None:
            typer.echo(json.dumps({"error": "Not found"}))
            raise typer.Exit(code=1)
        result = _goal_to_dict(goal)

    typer.echo(json.dumps(result, default=str))


@goal_app.command("progress")
def goal_progress(
    id: int = typer.Argument(..., help="Goal ID"),
):
    """Show progress toward a goal."""
    with get_session() as session:
        goal = session.get(Goal, id)
        if goal is None:
            typer.echo(json.dumps({"error": "Not found"}))
            raise typer.Exit(code=1)

        goal_dict = _goal_to_dict(goal)

        # Sum meals within the goal date range
        start_dt = datetime.datetime.combine(goal.start_date, datetime.time.min)
        end_dt = datetime.datetime.combine(goal.end_date, datetime.time.max)

        totals = (
            session.query(
                func.coalesce(func.sum(Meal.protein_g), 0.0).label("protein_g"),
                func.coalesce(func.sum(Meal.carbs_g), 0.0).label("carbs_g"),
                func.coalesce(func.sum(Meal.fat_g), 0.0).label("fat_g"),
                func.coalesce(func.sum(Meal.calories), 0.0).label("calories"),
            )
            .filter(Meal.logged_at >= start_dt, Meal.logged_at <= end_dt)
            .one()
        )

    actual = {
        "protein_g": totals.protein_g,
        "carbs_g": totals.carbs_g,
        "fat_g": totals.fat_g,
        "calories": totals.calories,
    }

    remaining = {
        "protein_g": (goal_dict["protein_g"] - actual["protein_g"]) if goal_dict["protein_g"] is not None else None,
        "carbs_g": (goal_dict["carbs_g"] - actual["carbs_g"]) if goal_dict["carbs_g"] is not None else None,
        "fat_g": (goal_dict["fat_g"] - actual["fat_g"]) if goal_dict["fat_g"] is not None else None,
        "calories": (goal_dict["calories"] - actual["calories"]) if goal_dict["calories"] is not None else None,
    }

    typer.echo(json.dumps({
        "goal": goal_dict,
        "actual": actual,
        "remaining": remaining,
    }, default=str))


@goal_app.command("delete")
def goal_delete(
    id: int = typer.Argument(..., help="Goal ID"),
):
    """Delete a goal by ID."""
    with get_session() as session:
        goal = session.get(Goal, id)
        if goal is None:
            typer.echo(json.dumps({"error": "Not found"}))
            raise typer.Exit(code=1)
        session.delete(goal)

    typer.echo(json.dumps({"deleted": True, "id": id}, default=str))
