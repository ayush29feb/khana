#!/usr/bin/env python3
"""
Seed script: populates food_catalog from tj-macros.md.

Usage:
    python scripts/seed_catalog.py [--dry-run] [--db-path PATH] [--file PATH]
"""

import argparse
import json
import os
import re
import sys
from pathlib import Path
from typing import Optional

DEFAULT_MD_PATH = Path.home() / ".openclaw/workspace/skills/meal-log/references/tj-macros.md"


def parse_gram_value(text: str) -> Optional[float]:
    """Extract numeric gram (or mL treated as g) value from a string like '100g', '240mL', '40g dry'."""
    m = re.search(r"([\d.]+)\s*(?:g|mL)", text, re.IGNORECASE)
    if m:
        return float(m.group(1))
    return None


def parse_macro_value(text: str) -> Optional[float]:
    """Parse a macro value like '3g', '<1g', '~130', '170' from a table cell."""
    text = text.strip()
    # Handle <1g or ~<1g
    if re.match(r"[<~]?\s*1g", text):
        return 1.0
    # Handle ~130 (no unit) for calories
    m = re.search(r"[~<]?\s*([\d.]+)", text)
    if m:
        return float(m.group(1))
    return None


def extract_brand_name(h3_title: str):
    """
    Given an H3 title (e.g. "TJ's Nonfat Greek Yogurt Plain (large tub)"),
    return (name, brand).
    """
    # Strip markdown header markers
    title = h3_title.strip().lstrip("#").strip()

    # Remove size info in parentheses at the end (e.g. "(large tub / ~454g)")
    title_clean = re.sub(r"\s*\([^)]*\)\s*$", "", title).strip()

    known_brands = {
        "TJ's": "Trader Joe's",
        "RXBAR": "RXBAR",
        "Hungryroot": "Hungryroot",
        "Babybel": "Babybel",
        "Impossible": "Impossible Foods",
        "Farmer's": "Farmer's",
    }

    for prefix, brand in known_brands.items():
        if title_clean.startswith(prefix):
            name = title_clean[len(prefix):].strip()
            # Strip any remaining size/flavour parentheticals and trailing em-dash clauses
            # e.g. "(Chocolate Sea Salt / Blueberry) — 1.8 oz" → ""
            name = re.sub(r"\s*\([^)]*\)", "", name).strip()
            name = re.sub(r"\s*—.*$", "", name).strip()
            # If name is empty (e.g. brand-only item), use the brand name
            if not name:
                name = brand
            return name, brand

    # Fallback: no brand detected
    return title_clean, None


def parse_md_entries(md_path: Path) -> list[dict]:
    """Parse tj-macros.md and return a list of food catalog entry dicts."""
    text = md_path.read_text(encoding="utf-8")
    lines = text.splitlines()

    entries = []
    i = 0

    while i < len(lines):
        line = lines[i]

        # Detect H3 item headers
        if line.startswith("### "):
            h3_title = line[4:].strip()
            name, brand = extract_brand_name(h3_title)

            serving_size_g = None
            calories = None
            protein = None
            fat = None
            carbs = None
            health_notes = None

            # Look ahead for serving size, table, and notes
            j = i + 1
            while j < len(lines):
                l = lines[j]

                # Stop at next H2 or H3
                if l.startswith("## ") or l.startswith("### "):
                    break

                # Serving size line
                if serving_size_g is None and re.search(r"[Ss]erving\s+size", l):
                    g = parse_gram_value(l)
                    if g:
                        serving_size_g = g

                # Serving size also sometimes in H3 header itself
                # e.g. "### RXBAR ... — 1.8 oz (52g)"
                if serving_size_g is None and "oz" in h3_title and "g)" in h3_title:
                    g = parse_gram_value(h3_title)
                    if g:
                        serving_size_g = g

                # Table rows: "| Calories | 170 | ..." or "| Calories | 60 |"
                if l.startswith("|") and "|" in l[1:]:
                    parts = [p.strip() for p in l.split("|")]
                    # parts[0] is empty (leading |), parts[1] is label, parts[2] is first value
                    if len(parts) >= 3:
                        label = parts[1].strip().lower()
                        val_str = parts[2].strip()

                        if label == "calories" and calories is None:
                            calories = parse_macro_value(val_str)
                        elif label == "protein" and protein is None:
                            # May contain bold markers like **12g**
                            val_clean = val_str.replace("*", "")
                            protein = parse_macro_value(val_clean)
                        elif label == "total fat" and fat is None:
                            fat = parse_macro_value(val_str)
                        elif label == "carbs" and carbs is None:
                            carbs = parse_macro_value(val_str)

                # Notes line
                if re.match(r"\*\*Notes:\*\*", l) and health_notes is None:
                    health_notes = re.sub(r"\*\*Notes:\*\*\s*", "", l).strip()

                j += 1

            # Only add entry if we have the required fields
            if all(v is not None for v in [serving_size_g, calories, protein, fat, carbs]):
                entries.append({
                    "name": name,
                    "brand": brand,
                    "serving_size_g": serving_size_g,
                    "calories_per_serving": calories,
                    "protein_per_serving": protein,
                    "fat_per_serving": fat,
                    "carbs_per_serving": carbs,
                    "health_notes": health_notes,
                })
            else:
                # Log what was missing to stderr for debugging
                missing = [k for k, v in {
                    "serving_size_g": serving_size_g,
                    "calories": calories,
                    "protein": protein,
                    "fat": fat,
                    "carbs": carbs,
                }.items() if v is None]
                print(f"[warn] Skipping '{name}' — missing: {missing}", file=sys.stderr)

        i += 1

    return entries


def seed(entries: list[dict], db_path: Optional[str], dry_run: bool) -> dict:
    """Seed entries into the database (or just simulate if dry_run)."""
    if dry_run:
        return {
            "seeded": len(entries),
            "skipped": 0,
            "entries": entries,
        }

    # Set db path env var BEFORE importing db module
    if db_path:
        os.environ["FOOD_DB_PATH"] = db_path

    # Import here so env var is already set
    sys.path.insert(0, str(Path(__file__).parent.parent))
    from food_tracker.db import get_session
    from food_tracker.models import FoodCatalog

    seeded = 0
    skipped = 0
    seeded_entries = []

    with get_session() as session:
        for e in entries:
            # Check by name + brand
            existing = (
                session.query(FoodCatalog)
                .filter_by(name=e["name"], brand=e["brand"])
                .first()
            )
            if existing:
                skipped += 1
            else:
                row = FoodCatalog(
                    name=e["name"],
                    brand=e["brand"],
                    serving_size_g=e["serving_size_g"],
                    calories_per_serving=e["calories_per_serving"],
                    protein_per_serving=e["protein_per_serving"],
                    fat_per_serving=e["fat_per_serving"],
                    carbs_per_serving=e["carbs_per_serving"],
                    health_notes=e["health_notes"],
                )
                session.add(row)
                seeded += 1
                seeded_entries.append(e)

    return {
        "seeded": seeded,
        "skipped": skipped,
        "entries": seeded_entries,
    }


def main():
    parser = argparse.ArgumentParser(description="Seed food_catalog from tj-macros.md")
    parser.add_argument(
        "--file",
        type=Path,
        default=DEFAULT_MD_PATH,
        help=f"Path to tj-macros.md (default: {DEFAULT_MD_PATH})",
    )
    parser.add_argument(
        "--db-path",
        type=str,
        default=None,
        help="Path to SQLite DB (default: FOOD_DB_PATH env or ~/.openclaw/workspace/food.db)",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Parse and print what would be seeded without writing to DB",
    )
    args = parser.parse_args()

    if not args.file.exists():
        print(f"Error: markdown file not found: {args.file}", file=sys.stderr)
        sys.exit(1)

    entries = parse_md_entries(args.file)

    result = seed(entries, db_path=args.db_path, dry_run=args.dry_run)

    print(json.dumps(result, indent=2))


if __name__ == "__main__":
    main()
