import json
import sys
from datetime import datetime
from typing import Optional

import typer
from sqlalchemy import text

from food_tracker.db import get_session
from food_tracker.models import FoodCatalog, PantryTransaction, TransactionReason

pantry_app = typer.Typer(help="Manage pantry inventory")


def _tx_to_dict(tx: PantryTransaction) -> dict:
    return {
        "id": tx.id,
        "catalog_id": tx.catalog_id,
        "delta": tx.delta,
        "reason": tx.reason.value if hasattr(tx.reason, "value") else tx.reason,
        "occurred_at": tx.occurred_at.isoformat() if isinstance(tx.occurred_at, datetime) else str(tx.occurred_at),
        "notes": getattr(tx, "notes", None),
    }


@pantry_app.command("add")
def pantry_add(
    catalog_id: int = typer.Option(..., "--catalog-id", help="Catalog entry ID"),
    servings: float = typer.Option(..., "--servings", help="Number of servings to add"),
    notes: Optional[str] = typer.Option(None, "--notes", help="Optional notes"),
):
    """Add items to the pantry (grocery purchase)."""
    with get_session() as session:
        entry = session.get(FoodCatalog, catalog_id)
        if entry is None:
            typer.echo(json.dumps({"error": "Catalog entry not found"}))
            raise typer.Exit(code=1)

        tx = PantryTransaction(
            catalog_id=catalog_id,
            delta=servings,
            reason=TransactionReason.grocery,
            occurred_at=datetime.utcnow(),
        )
        session.add(tx)
        session.flush()
        result = _tx_to_dict(tx)

    typer.echo(json.dumps(result, default=str))


@pantry_app.command("use")
def pantry_use(
    catalog_id: int = typer.Option(..., "--catalog-id", help="Catalog entry ID"),
    servings: float = typer.Option(..., "--servings", help="Number of servings to consume"),
    notes: Optional[str] = typer.Option(None, "--notes", help="Optional notes"),
):
    """Consume from pantry (manual reduction, not linked to a meal)."""
    with get_session() as session:
        entry = session.get(FoodCatalog, catalog_id)
        if entry is None:
            typer.echo(json.dumps({"error": "Catalog entry not found"}))
            raise typer.Exit(code=1)

        tx = PantryTransaction(
            catalog_id=catalog_id,
            delta=-servings,
            reason=TransactionReason.manual,
            occurred_at=datetime.utcnow(),
        )
        session.add(tx)
        session.flush()
        result = _tx_to_dict(tx)

    typer.echo(json.dumps(result, default=str))


@pantry_app.command("list")
def pantry_list():
    """Show current pantry state."""
    with get_session() as session:
        rows = session.execute(text("SELECT * FROM pantry")).fetchall()
        result = [
            {
                "catalog_id": row.catalog_id,
                "name": row.name,
                "brand": row.brand,
                "servings_remaining": row.servings_remaining,
                "protein_available": row.protein_available,
            }
            for row in rows
        ]

    typer.echo(json.dumps(result, default=str))


@pantry_app.command("history")
def pantry_history(
    catalog_id: Optional[int] = typer.Option(None, "--catalog-id", help="Filter by catalog entry ID"),
):
    """Show transaction log."""
    with get_session() as session:
        query = session.query(PantryTransaction).order_by(PantryTransaction.occurred_at.desc())
        if catalog_id is not None:
            query = query.filter(PantryTransaction.catalog_id == catalog_id)
        txs = query.all()
        result = [_tx_to_dict(tx) for tx in txs]

    typer.echo(json.dumps(result, default=str))
