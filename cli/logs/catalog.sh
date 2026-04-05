#!/usr/bin/env bash
# Seed food catalog from images (file_26–42, file_54–66).
# Also cleans all meals and pantry transactions first.
# Run from cli/ directory: bash logs/catalog.sh
set -euo pipefail

FOOD=".venv/bin/food"
DB="$HOME/.openclaw/workspace/food.db"

echo "→ Cleaning database..."
python3 - <<'PY'
import sqlite3, os
conn = sqlite3.connect(os.path.expanduser(os.environ.get('DB', '~/.openclaw/workspace/food.db')))
conn.execute('DELETE FROM pantry_transactions')
conn.execute('DELETE FROM meals')
conn.execute('DELETE FROM food_catalog')
conn.execute("DELETE FROM sqlite_sequence WHERE name IN ('pantry_transactions','meals','food_catalog')"
             if conn.execute("SELECT name FROM sqlite_master WHERE name='sqlite_sequence'").fetchone()
             else "SELECT 1")
conn.commit()
print('✓ Cleaned')
PY

echo "→ Adding catalog items from images..."

# ── file_26: TJ's Southwest Chopped Salad Kit ──
# Back of bag: 170 cal per serving (~100g). Protein ~5g est.
$FOOD catalog add \
  --name "Southwest Chopped Salad Kit" --brand "Trader Joe's" \
  --serving-size-g 100 \
  --protein 5 --carbs 15 --fat 11 --calories 170

# ── file_27: TJ's Miso Crunch Chopped Salad Kit ──
# Front of bag (no label visible). Using standard TJ's Miso Crunch label values.
$FOOD catalog add \
  --name "Miso Crunch Chopped Salad Kit" --brand "Trader Joe's" \
  --serving-size-g 100 \
  --protein 4 --carbs 10 --fat 10 --calories 140

# ── file_28: TJ's Broccoli & Kale Slaw ──
# Back of bag: 200 cal per serving (~85g). Macros est.
$FOOD catalog add \
  --name "Broccoli & Kale Slaw" --brand "Trader Joe's" \
  --serving-size-g 85 \
  --protein 4 --carbs 10 --fat 18 --calories 200

# ── file_29: TJ's Cage Free Hard-Cooked Peeled Eggs ──
# Label: serving 1 egg (~50g), 60 cal, ~5g fat, 0g carbs, 6g protein
$FOOD catalog add \
  --name "Cage Free Hard-Cooked Peeled Eggs" --brand "Trader Joe's" \
  --serving-size-g 50 \
  --protein 6 --carbs 0 --fat 5 --calories 60

# ── file_30: TJ's Lactose Free Reduced Fat Milk 2% ──
# Label: 1 cup (240mL), 130 cal, 5g fat, 14g carbs, 9g protein
$FOOD catalog add \
  --name "Lactose Free Reduced Fat Milk 2%" --brand "Trader Joe's" \
  --serving-size-g 240 \
  --protein 9 --carbs 14 --fat 5 --calories 130

# ── file_31: Nancy's Plain Greek Yogurt ──
# White tub, purple lid. Nonfat Greek: ~113g serving, 90 cal, 17g protein.
$FOOD catalog add \
  --name "Nancy Plain Greek Yogurt" --brand "Nancy's" \
  --serving-size-g 113 \
  --protein 17 --carbs 5 --fat 0 --calories 90

# ── file_32: Shawarma Hummus (TJ's) ──
# Label: ~80 cal per 2 tbsp (28g)
$FOOD catalog add \
  --name "Shawarma Hummus" --brand "Trader Joe's" \
  --serving-size-g 28 \
  --protein 2 --carbs 5 --fat 6 --calories 80

# ── file_33: TJ's Organic Baked Tofu Teriyaki ──
# Orange pack: ~80 cal per piece (~85g)
$FOOD catalog add \
  --name "Organic Baked Tofu Teriyaki" --brand "Trader Joe's" \
  --serving-size-g 85 \
  --protein 9 --carbs 5 --fat 4 --calories 80

# ── file_34: TJ's Sriracha Flavored Baked Tofu ──
# Label: 1 piece serving, 70 cal, ~3.5g fat, 3g carbs, 9g protein
$FOOD catalog add \
  --name "Sriracha Flavored Baked Tofu" --brand "Trader Joe's" \
  --serving-size-g 85 \
  --protein 9 --carbs 3 --fat 3.5 --calories 70

# ── file_35: Babybel Mini Cheese ──
# Label: 1 piece (20g), 70 cal, 6g fat, 0g carbs, 5g protein
$FOOD catalog add \
  --name "Mini Cheese" --brand "Babybel" \
  --serving-size-g 20 \
  --protein 5 --carbs 0 --fat 6 --calories 70

# ── file_36: Whole Milk Ricotta ──
# White tub: 1/4 cup (55g), 80 cal, 6g fat, 3g carbs, 7g protein
$FOOD catalog add \
  --name "Whole Milk Ricotta" \
  --serving-size-g 55 \
  --protein 7 --carbs 3 --fat 6 --calories 80

# ── file_37: TJ's Marinated Fresh Mozzarella ──
# Tub with marinated items. Standard fresh mozz: 30g serving, 80 cal.
$FOOD catalog add \
  --name "Marinated Fresh Mozzarella" --brand "Trader Joe's" \
  --serving-size-g 30 \
  --protein 6 --carbs 0 --fat 6 --calories 80

# ── file_38: TJ's Buttermilk Protein Pancake Mix ──
# Label: 1/3 cup dry (40g), 140 cal, 2g fat, 23g carbs, 8g protein
$FOOD catalog add \
  --name "Buttermilk Protein Pancake Mix" --brand "Trader Joe's" \
  --serving-size-g 40 \
  --protein 8 --carbs 23 --fat 2 --calories 140

# ── file_39: Pumpkin Seeds (Pepitas) ──
# Label: 1/4 cup (30g), 170 cal, 14g fat, 5g carbs, 10g protein
$FOOD catalog add \
  --name "Pumpkin Seeds (Pepitas)" \
  --serving-size-g 30 \
  --protein 10 --carbs 5 --fat 14 --calories 170

# ── file_41: RXBAR ──
# Label shows 12g protein. Standard RXBAR: 52g bar, 210 cal, 9g fat, 24g carbs, 12g protein
$FOOD catalog add \
  --name "RXBAR" --brand "RXBAR" \
  --serving-size-g 52 \
  --protein 12 --carbs 24 --fat 9 --calories 210

# ── file_42: Chicken Nuggets (Impossible Foods) ──
# "Don't Chicken Out on Helping the Planet" plant-based. 140 cal per serving.
$FOOD catalog add \
  --name "Chicken Nuggets" --brand "Impossible Foods" \
  --serving-size-g 85 \
  --protein 14 --carbs 12 --fat 8 --calories 140

# ── file_54: Chickpea Pasta (Lazy Food) ──
# "Effortless Eats" meal kit. 300 cal per 1 cup prepared (226g).
$FOOD catalog add \
  --name "Chickpea Pasta" --brand "Lazy Food" \
  --serving-size-g 226 \
  --protein 15 --carbs 40 --fat 10 --calories 300

# ── file_55: SW Chopped Salad Kit (Taylor Farms) ──
# Label: ~4.85 servings, 1 cup (100g), 160 cal
$FOOD catalog add \
  --name "SW Chopped Salad Kit" --brand "Taylor Farms" \
  --serving-size-g 100 \
  --protein 5 --carbs 12 --fat 9 --calories 160

# ── file_56: Vodka Sauce (Carbone) ──
# Standard Carbone Vodka Sauce: 1/2 cup (125g), 100 cal, 7g fat, 9g carbs, 2g protein
$FOOD catalog add \
  --name "Vodka Sauce" --brand "Carbone" \
  --serving-size-g 125 \
  --protein 2 --carbs 9 --fat 7 --calories 100

# ── file_58: Organic Corn+Wheat Tortillas (La Tortilla Factory) ──
# Label: 1 tortilla (41g), 80 cal, 1g fat, 17g carbs, 2g protein
$FOOD catalog add \
  --name "Organic Corn+Wheat Tortillas" --brand "La Tortilla Factory" \
  --serving-size-g 41 \
  --protein 2 --carbs 17 --fat 1 --calories 80

# ── file_60: Chorizo Seitan (Upton's Naturals) ──
# Label: 2 oz (57g), 100 cal. Seitan is high protein ~17g.
$FOOD catalog add \
  --name "Chorizo Seitan" --brand "Upton's Naturals" \
  --serving-size-g 57 \
  --protein 17 --carbs 3 --fat 6.5 --calories 100

# ── file_61: Smoked Five Spice Tofu (Organic) ──
# Label: 2.5 servings, 2 pieces per serving, 180 cal.
# Weight 2 pieces est ~85g. Fat ~1.5g, Carbs ~3g, Protein ~17g.
$FOOD catalog add \
  --name "Smoked Five Spice Tofu" \
  --serving-size-g 85 \
  --protein 17 --carbs 3 --fat 1.5 --calories 180

# ── file_62: Greek Yogurt Vanilla (TJ's) ──
# Blue tub: 4 servings, 6oz (170g) per serving, 120 cal
$FOOD catalog add \
  --name "Greek Yogurt Vanilla" --brand "Trader Joe's" \
  --serving-size-g 170 \
  --protein 14 --carbs 16 --fat 0 --calories 120

# ── file_64: Feta Cheese (Simple Truth) ──
# Label: ~2 servings. Per serving ~28g, 70 cal, 5g fat, 1g carbs, 4g protein
$FOOD catalog add \
  --name "Feta Crumbles" --brand "Simple Truth" \
  --serving-size-g 28 \
  --protein 4 --carbs 1 --fat 5 --calories 70

# ── file_66: Casarecce Pasta (Rao's Homemade) ──
# Dry pasta: 2 oz (56g) serving, ~200 cal, 1g fat, 40g carbs, 7g protein
$FOOD catalog add \
  --name "Casarecce Pasta" --brand "Rao's" \
  --serving-size-g 56 \
  --protein 7 --carbs 40 --fat 1 --calories 200

echo "✓ Catalog seeded — $(sqlite3 \"$DB\" 'SELECT COUNT(*) FROM food_catalog') items added."
