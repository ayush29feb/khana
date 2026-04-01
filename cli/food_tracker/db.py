import os
from collections.abc import Iterator
from contextlib import contextmanager
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, Session

DB_PATH = os.environ.get(
    "FOOD_DB_PATH",
    os.path.expanduser("~/.openclaw/workspace/food.db"),
)

PANTRY_VIEW_SQL = """
DROP VIEW IF EXISTS pantry;
CREATE VIEW pantry AS
SELECT
    c.id          AS catalog_id,
    c.name,
    c.brand,
    c.protein_per_serving,
    c.carbs_per_serving,
    c.fat_per_serving,
    c.health_notes,
    SUM(t.delta)                         AS servings_remaining,
    SUM(t.delta) * c.protein_per_serving AS protein_available
FROM pantry_transactions t
JOIN food_catalog c ON c.id = t.catalog_id
GROUP BY t.catalog_id
HAVING SUM(t.delta) > 0
"""

def _make_engine(path: str):
    engine = create_engine(f"sqlite:///{path}", echo=False)
    from .models import Base
    Base.metadata.create_all(engine)
    with engine.connect() as conn:
        for stmt in PANTRY_VIEW_SQL.split(";"):
            stmt = stmt.strip()
            if stmt:
                conn.execute(text(stmt))
        conn.commit()
    return engine


_engine = None


def get_engine():
    global _engine
    if _engine is None:
        _engine = _make_engine(DB_PATH)
    return _engine


SessionLocal = None


@contextmanager
def get_session() -> Iterator[Session]:
    global SessionLocal
    if SessionLocal is None:
        SessionLocal = sessionmaker(bind=get_engine())
    session = SessionLocal()
    try:
        yield session
        session.commit()
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()
