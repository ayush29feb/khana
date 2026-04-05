import shutil
from pathlib import Path


def ingest_photo(db_path: str, source: str, category: str, record_id: int) -> str:
    """
    Copy source image into the images directory alongside the DB.
    Returns the relative path stored in the DB, e.g. 'meals/42.jpg'.
    """
    dest_dir = Path(db_path).parent / "images" / category
    dest_dir.mkdir(parents=True, exist_ok=True)
    dest = dest_dir / f"{record_id}.jpg"
    shutil.copy2(source, dest)
    return f"{category}/{record_id}.jpg"
