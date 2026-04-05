#!/usr/bin/env bash
# WF order B0CQPLFTDY-0 — Apr 1, 2026
# Adds new catalog entries + pantry stock for all food items.
# Run from cli/ directory: bash logs/wf_apr01.sh
set -euo pipefail

FOOD=".venv/bin/food"
DB="$HOME/.openclaw/workspace/food.db"

# Helper: look up catalog ID by name + brand
cid() {
  DB="$DB" FOOD_NAME="$1" FOOD_BRAND="${2:-}" python3 -c "
import sqlite3, os
conn = sqlite3.connect(os.environ['DB'])
row = conn.execute('SELECT id FROM food_catalog WHERE name=? AND brand=?',
    (os.environ['FOOD_NAME'], os.environ['FOOD_BRAND'])).fetchone()
print(row[0] if row else '')
"
}

echo "→ Adding new catalog entries for WF items not yet in catalog..."

# 365 Feta Crumbles — same macros as generic feta
$FOOD catalog add \
  --name "Feta Crumbles" --brand "365" \
  --serving-size-g 28 \
  --protein 4 --carbs 1 --fat 5 --calories 70

# Severino Calabrese Fusilli — dry pasta, 2 oz serving
$FOOD catalog add \
  --name "Calabrese Fusilli" --brand "Severino" \
  --serving-size-g 56 \
  --protein 7 --carbs 40 --fat 1 --calories 200

# Mitica Parmigiano Reggiano 24-month — 1 oz serving
$FOOD catalog add \
  --name "Parmigiano Reggiano" --brand "Mitica" \
  --serving-size-g 28 \
  --protein 10 --carbs 1 --fat 7 --calories 110 \
  --health-notes "24-month aged, raw milk"

# WFM Brioche Hot Dog Buns — 1 bun serving (~55g)
$FOOD catalog add \
  --name "Brioche Hot Dog Buns" --brand "WFM" \
  --serving-size-g 55 \
  --protein 5 --carbs 24 --fat 4 --calories 150

# Vital Farms Pasture Raised Eggs — 1 large egg
$FOOD catalog add \
  --name "Pasture Raised Eggs" --brand "Vital Farms" \
  --serving-size-g 50 \
  --protein 6 --carbs 0 --fat 5 --calories 70

# Ayoh Foods Miso Mayo — 1 tbsp (14g)
$FOOD catalog add \
  --name "Miso Mayo" --brand "Ayoh" \
  --serving-size-g 14 \
  --protein 0 --carbs 1 --fat 10 --calories 90

# HIPPEAS Chickpea Puffs Groovy White Cheddar — 1 individual pack (23g)
$FOOD catalog add \
  --name "Chickpea Puffs" --brand "HIPPEAS" \
  --serving-size-g 23 \
  --protein 3 --carbs 13 --fat 4 --calories 100

# Taylor Farms Mexican Style Street Corn Chopped Salad Kit — 1 cup (100g)
$FOOD catalog add \
  --name "Mexican Street Corn Salad Kit" --brand "Taylor Farms" \
  --serving-size-g 100 \
  --protein 4 --carbs 14 --fat 9 --calories 150

# Cedar's Organic Hot Honey Hummus — 2 tbsp (28g)
$FOOD catalog add \
  --name "Hot Honey Hummus" --brand "Cedar's" \
  --serving-size-g 28 \
  --protein 3 --carbs 7 --fat 5 --calories 80

# WFM Mt. Athos Fire Sourdough — 1 slice (~45g)
$FOOD catalog add \
  --name "Fire Sourdough" --brand "WFM" \
  --serving-size-g 45 \
  --protein 4 --carbs 22 --fat 1 --calories 110

echo "→ Looking up catalog IDs..."

# Existing catalog items
CID_CHICKPEA_PASTA=$(cid "Chickpea Pasta" "Lazy Food")
CID_TORTILLAS=$(cid "Organic Corn+Wheat Tortillas" "La Tortilla Factory")
CID_NANCY_YOGURT=$(cid "Nancy Plain Greek Yogurt" "Nancy's")
CID_RAOS_PASTA=$(cid "Casarecce Pasta" "Rao's")
CID_SEITAN=$(cid "Chorizo Seitan" "Upton's Naturals")
CID_TOFU=$(cid "Smoked Five Spice Tofu" "")
CID_VODKA_SAUCE=$(cid "Vodka Sauce" "Carbone")

# Newly added catalog items
CID_FETA_365=$(cid "Feta Crumbles" "365")
CID_FUSILLI=$(cid "Calabrese Fusilli" "Severino")
CID_PARMESAN=$(cid "Parmigiano Reggiano" "Mitica")
CID_BRIOCHE=$(cid "Brioche Hot Dog Buns" "WFM")
CID_EGGS=$(cid "Pasture Raised Eggs" "Vital Farms")
CID_MAYO=$(cid "Miso Mayo" "Ayoh")
CID_HIPPEAS=$(cid "Chickpea Puffs" "HIPPEAS")
CID_CORN_SALAD=$(cid "Mexican Street Corn Salad Kit" "Taylor Farms")
CID_HUMMUS=$(cid "Hot Honey Hummus" "Cedar's")
CID_SOURDOUGH=$(cid "Fire Sourdough" "WFM")

NOTES="WF order B0CQPLFTDY-0, Apr 1 2026"

echo "→ Adding pantry stock..."

# Lazy Food Chickpea Pasta — 1 pack = 2 servings
$FOOD pantry add --catalog-id "$CID_CHICKPEA_PASTA" --servings 2 --notes "$NOTES"

# 365 Feta Crumbles 6oz — 28g serving → 170g / 28g ≈ 6 servings
$FOOD pantry add --catalog-id "$CID_FETA_365" --servings 6 --notes "$NOTES"

# Severino Fusilli 9oz dry — 56g serving → 255g / 56g ≈ 4.5 servings
$FOOD pantry add --catalog-id "$CID_FUSILLI" --servings 4.5 --notes "$NOTES"

# Mitica Parmigiano 0.87 lb — 28g serving → 395g / 28g ≈ 14 servings
$FOOD pantry add --catalog-id "$CID_PARMESAN" --servings 14 --notes "$NOTES"

# WFM Brioche Hot Dog Buns — 9.52oz pack, 6 buns
$FOOD pantry add --catalog-id "$CID_BRIOCHE" --servings 6 --notes "$NOTES"

# Vital Farms Eggs — 18 count
$FOOD pantry add --catalog-id "$CID_EGGS" --servings 18 --notes "$NOTES"

# Ayoh Miso Mayo 12oz — 14g serving → 340g / 14g ≈ 24 servings
$FOOD pantry add --catalog-id "$CID_MAYO" --servings 24 --notes "$NOTES"

# La Tortilla Factory Tortillas 6ct — 6 servings
$FOOD pantry add --catalog-id "$CID_TORTILLAS" --servings 6 --notes "$NOTES"

# HIPPEAS Chickpea Puffs — 6-pack of 0.8oz bags = 6 servings
$FOOD pantry add --catalog-id "$CID_HIPPEAS" --servings 6 --notes "$NOTES"

# Nancy's Yogurt 24oz x 2 — 113g serving → 680g × 2 / 113g ≈ 12 servings
$FOOD pantry add --catalog-id "$CID_NANCY_YOGURT" --servings 12 --notes "$NOTES"

# Taylor Farms Mexican Street Corn 11.62oz — 100g serving → 329g / 100g ≈ 3 servings
$FOOD pantry add --catalog-id "$CID_CORN_SALAD" --servings 3 --notes "$NOTES"

# Rao's Casarecce 16oz dry — 56g serving → 454g / 56g ≈ 8 servings
$FOOD pantry add --catalog-id "$CID_RAOS_PASTA" --servings 8 --notes "$NOTES"

# Cedar's Hot Honey Hummus — ~10oz container, 28g serving → 283g / 28g ≈ 10 servings
$FOOD pantry add --catalog-id "$CID_HUMMUS" --servings 10 --notes "$NOTES"

# WFM Fire Sourdough half loaf — 45g serving → ~270g half loaf / 45g ≈ 6 servings
$FOOD pantry add --catalog-id "$CID_SOURDOUGH" --servings 6 --notes "$NOTES"

# Upton's Chorizo Seitan 8oz — 57g serving → 227g / 57g ≈ 4 servings
$FOOD pantry add --catalog-id "$CID_SEITAN" --servings 4 --notes "$NOTES"

# Jenny's Organic Smoked Five Spice Tofu 8oz — 85g serving → 227g / 85g ≈ 2.5 servings
$FOOD pantry add --catalog-id "$CID_TOFU" --servings 2.5 --notes "$NOTES"

# Carbone Spicy Vodka Sauce 24oz — 125g serving → 680g / 125g ≈ 5 servings
$FOOD pantry add --catalog-id "$CID_VODKA_SAUCE" --servings 5 --notes "$NOTES"

echo ""
echo "✓ WF Apr 1 order stocked."
echo ""
sqlite3 "$DB" "SELECT fc.name, fc.brand, pt.delta FROM pantry_transactions pt JOIN food_catalog fc ON fc.id=pt.catalog_id ORDER BY pt.id;"
