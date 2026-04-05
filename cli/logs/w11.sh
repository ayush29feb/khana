#!/usr/bin/env bash
# Log Week 11 (Mar 9–15, 2026) meals.
# Run AFTER logs/groceries.sh
# Run from cli/ directory: bash logs/w11.sh
set -euo pipefail

FOOD=".venv/bin/food"
DB="$HOME/.openclaw/workspace/food.db"

# Look up catalog ID by name (and optional brand)
cid() {
  DB="$DB" FOOD_NAME="$1" FOOD_BRAND="${2:-}" python3 -c "
import sqlite3, os
conn = sqlite3.connect(os.environ['DB'])
row = conn.execute('SELECT id FROM food_catalog WHERE name=? AND brand=?',
    (os.environ['FOOD_NAME'], os.environ['FOOD_BRAND'])).fetchone()
print(row[0] if row else '')
"
}

OATS=$(     cid "Rolled Oats")
ISOPURE=$(  cid "Zero Carb Protein Powder" "Isopure")
PB=$(       cid "Peanut Butter")
BANANA=$(   cid "Banana")
EDAMAME=$(  cid "Edamame Shelled")
GRANOLA=$(  cid "Granola")
SOURDOUGH=$(cid "Sourdough Bread")
PAVBHAJI=$( cid "Pav Bhaji" "homemade")
EGGS=$(     cid "Fresh Eggs")
SWSALAD=$(  cid "Southwest Chopped Salad Kit" "Trader Joe's")
MILK=4         # Lactose Free Reduced Fat Milk 2%
YOGURT=5       # Nonfat Greek Yogurt Plain
TOFU_TER=7     # Organic Baked Tofu Teriyaki

echo "→ Logging W11 meals (Mar 9–15, 2026)..."

# ── Mon Mar 9 ──
$FOOD meal add-restaurant \
  --name "Miso mushroom sandwich" --protein 12 --carbs 35 --fat 12 \
  --logged-at "2026-03-09T15:00:00" --is-estimate --notes "Tuck Up"

$FOOD meal add-home \
  --name "Pav Bhaji" \
  --ingredient "$PAVBHAJI:2" \
  --logged-at "2026-03-09T19:30:00" --is-estimate \
  --notes "Homemade w/ Stuti & Janhavi at Janhavi's place"

# ── Tue Mar 10 ──
$FOOD meal add-restaurant \
  --name "Pad See Ew + tofu dish" --protein 33 --carbs 60 --fat 20 \
  --logged-at "2026-03-10T13:00:00" --is-estimate --notes "Thai restaurant"

$FOOD meal add-home \
  --name "Pav Bhaji leftovers + sourdough" \
  --ingredient "$PAVBHAJI:1.5" \
  --ingredient "$SOURDOUGH:0.75" \
  --logged-at "2026-03-10T19:00:00" --is-estimate

# ── Wed Mar 11 ──
# Overnight oats: 0.75 srv oats (5g) + 1.5 srv milk (14g) ≈ 19g
$FOOD meal add-home \
  --name "Overnight oats + milk" \
  --ingredient "$OATS:0.75" \
  --ingredient "$MILK:1.5" \
  --logged-at "2026-03-11T08:00:00" --is-estimate --notes "400ml lactose free milk"

$FOOD meal add-restaurant \
  --name "Sofia sandwich + pasta salad" --protein 23 --carbs 55 --fat 18 \
  --logged-at "2026-03-11T13:00:00" --is-estimate --notes "Cappone's"

# Protein shake: 2 scoops Isopure (50g) + PB (7g) + 2 bananas (2g) ≈ 59g
$FOOD meal add-home \
  --name "Protein shake" \
  --ingredient "$ISOPURE:2" \
  --ingredient "$PB:1" \
  --ingredient "$BANANA:2" \
  --logged-at "2026-03-11T18:00:00" --is-estimate --notes "2 scoops Isopure + 2 bananas + PB"

# ── Thu Mar 12 ──
$FOOD meal add-home \
  --name "Overnight oats + milk" \
  --ingredient "$OATS:0.75" \
  --ingredient "$MILK:1.5" \
  --logged-at "2026-03-12T12:00:00" --is-estimate

# 4 eggs × 7g = 28g protein
$FOOD meal add-home \
  --name "4-egg omelette with butter" \
  --ingredient "$EGGS:4" \
  --logged-at "2026-03-12T14:00:00" --is-estimate

# ── Fri Mar 13 ──
$FOOD meal add-home \
  --name "Overnight oats + lactose free milk" \
  --ingredient "$OATS:0.75" \
  --ingredient "$MILK:1.5" \
  --logged-at "2026-03-13T10:00:00" --is-estimate

$FOOD meal add-restaurant \
  --name "Chipotle sofritas bowl + guacamole" --protein 28 --carbs 65 --fat 25 \
  --logged-at "2026-03-13T20:00:00" --is-estimate --notes "Chipotle"

# ── Sat Mar 14 — not logged ──

# ── Sun Mar 15 ──
# Yogurt bowl: 1.1 srv yogurt (22g) + 1.5 srv granola (6g) ≈ 28g
$FOOD meal add-home \
  --name "Greek yogurt bowl + granola + berries" \
  --ingredient "$YOGURT:1.1" \
  --ingredient "$GRANOLA:1.5" \
  --logged-at "2026-03-15T12:00:00" --is-estimate --notes "250g yogurt"

# Salad: 3.83 srv salad (19g) + 1 srv tofu (15g) + 0.64 srv edamame (7g) ≈ 41g
$FOOD meal add-home \
  --name "Southwest salad + half teriyaki tofu + edamame" \
  --ingredient "$SWSALAD:3.83" \
  --ingredient "$TOFU_TER:1" \
  --ingredient "$EDAMAME:0.64" \
  --logged-at "2026-03-15T17:00:00" --is-estimate \
  --notes "Whole bag salad + 0.5 pack TJ's Teriyaki Tofu + 64g edamame"

echo "✓ W11 logged."
