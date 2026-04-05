#!/usr/bin/env bash
# Initialize pantry from all known grocery runs.
#
# Sources:
#   Mar 14 (W11, $150.06) — in archive, NOT YET INCLUDED
#   Mar 22 (W12, $116.06) — reconstructed from W13 pantry snapshot
#   Mar 29 (WF run)       — reconstructed from W14 pantry snapshot (new/unopened items)
#
# Run from cli/ directory: bash logs/groceries.sh
# Must run BEFORE week meal-log scripts.
set -euo pipefail

FOOD=".venv/bin/food"
DB="$HOME/.openclaw/workspace/food.db"

json_id() { python3 -c "import json,sys; print(json.load(sys.stdin)['id'])"; }

# ─── Reset ────────────────────────────────────────────────────────────────────
echo "→ Resetting meals and pantry transactions..."
sqlite3 "$DB" "DELETE FROM pantry_transactions; DELETE FROM meals;"

# ─── Catalog: add all items needed for home meals + grocery runs ──────────────
echo "→ Seeding additional catalog items..."
sqlite3 "$DB" "DELETE FROM food_catalog WHERE name IN (
  'Rolled Oats','Zero Carb Protein Powder','Peanut Butter','Banana',
  'Edamame Shelled','Granola','Sourdough Bread','Pav Bhaji','Fresh Eggs',
  'Southwest Chopped Salad Kit','Greek Yogurt Vanilla','Whole Milk Ricotta',
  'Almonds','Hemp Seeds','Chia Seeds','Veg Italian Sausage','Garlic Naan',
  'Granola Ginger Almond','Nancy Plain Greek Yogurt','Five Spice Tofu',
  'Chorizo Seitan','Feta Crumbles','Parmigiano Reggiano','Chickpea Pasta',
  'Fusilli Pasta','Casarecce Pasta','Corn Wheat Tortillas','Brioche Hot Dog Buns',
  'Fire Sourdough','Chickpea Puffs','Hot Honey Hummus','Kimbap'
);"

# — W11 home meal ingredients —
OATS=$(       $FOOD catalog add --name "Rolled Oats"              --serving-size-g 50  --protein 7  --carbs 27 --fat 3  --calories 180 | json_id)
ISOPURE=$(    $FOOD catalog add --name "Zero Carb Protein Powder" --brand "Isopure"    --serving-size-g 31  --protein 25 --carbs 0  --fat 0  --calories 100 | json_id)
PB=$(         $FOOD catalog add --name "Peanut Butter"            --serving-size-g 32  --protein 7  --carbs 7  --fat 16 --calories 190 | json_id)
BANANA=$(     $FOOD catalog add --name "Banana"                   --serving-size-g 118 --protein 1  --carbs 27 --fat 0  --calories 105 | json_id)
EDAMAME=$(    $FOOD catalog add --name "Edamame Shelled"          --serving-size-g 100 --protein 11 --carbs 10 --fat 5  --calories 121 | json_id)
GRANOLA=$(    $FOOD catalog add --name "Granola"                  --serving-size-g 40  --protein 4  --carbs 30 --fat 5  --calories 180 | json_id)
SOURDOUGH=$(  $FOOD catalog add --name "Sourdough Bread"          --serving-size-g 55  --protein 6  --carbs 27 --fat 1  --calories 140 | json_id)
PAVBHAJI=$(   $FOOD catalog add --name "Pav Bhaji" --brand "homemade" --serving-size-g 200 --protein 9 --carbs 28 --fat 8 --calories 220 | json_id)
EGGS=$(       $FOOD catalog add --name "Fresh Eggs"               --serving-size-g 50  --protein 7  --carbs 0  --fat 5  --calories 72  | json_id)
SWSALAD=$(    $FOOD catalog add --name "Southwest Chopped Salad Kit" --brand "Trader Joe's" --serving-size-g 100 --protein 5 --carbs 15 --fat 8 --calories 150 | json_id)

# — W13 pantry items not already in catalog (IDs 1–17) —
YOGVAN=$(     $FOOD catalog add --name "Greek Yogurt Vanilla"     --brand "Trader Joe's" --serving-size-g 227 --protein 11 --carbs 17 --fat 0 --calories 120 | json_id)
RICOTTA=$(    $FOOD catalog add --name "Whole Milk Ricotta"        --serving-size-g 55  --protein 5  --carbs 3  --fat 8  --calories 100 | json_id)
ALMONDS=$(    $FOOD catalog add --name "Almonds"                   --serving-size-g 28  --protein 6  --carbs 6  --fat 14 --calories 164 | json_id)
HEMP=$(       $FOOD catalog add --name "Hemp Seeds"                --serving-size-g 28  --protein 10 --carbs 1  --fat 14 --calories 166 | json_id)
CHIA=$(       $FOOD catalog add --name "Chia Seeds"                --serving-size-g 28  --protein 5  --carbs 12 --fat 9  --calories 138 | json_id)
VEGSAUS=$(    $FOOD catalog add --name "Veg Italian Sausage"       --brand "Trader Joe's" --serving-size-g 85 --protein 10 --carbs 3 --fat 4 --calories 90 | json_id)
NAAN=$(       $FOOD catalog add --name "Garlic Naan"               --brand "Trader Joe's" --serving-size-g 90 --protein 5  --carbs 38 --fat 2  --calories 190 | json_id)
GRANGINGER=$( $FOOD catalog add --name "Granola Ginger Almond"    --brand "Trader Joe's" --serving-size-g 40 --protein 3  --carbs 30 --fat 6  --calories 185 | json_id)

# — W14 Whole Foods items —
NANCYYOG=$(   $FOOD catalog add --name "Nancy Plain Greek Yogurt"  --brand "Nancy's"    --serving-size-g 170 --protein 22 --carbs 5  --fat 0  --calories 110 | json_id)
FIVESPICE=$(  $FOOD catalog add --name "Five Spice Tofu"           --brand "Jenny's"    --serving-size-g 85  --protein 20 --carbs 3  --fat 5  --calories 135 | json_id)
SEITAN=$(     $FOOD catalog add --name "Chorizo Seitan"            --brand "Upton's"    --serving-size-g 76  --protein 17 --carbs 7  --fat 4  --calories 130 | json_id)
FETA=$(       $FOOD catalog add --name "Feta Crumbles"             --brand "365"        --serving-size-g 28  --protein 6  --carbs 0  --fat 6  --calories 80  | json_id)
PARMESAN=$(   $FOOD catalog add --name "Parmigiano Reggiano"       --brand "Mitica"     --serving-size-g 28  --protein 10 --carbs 0  --fat 7  --calories 110 | json_id)
CKPASTA=$(    $FOOD catalog add --name "Chickpea Pasta"            --brand "Lazy Food"  --serving-size-g 85  --protein 15 --carbs 25 --fat 5  --calories 205 | json_id)
FUSILLI=$(    $FOOD catalog add --name "Fusilli Pasta"             --brand "Severino"   --serving-size-g 56  --protein 7  --carbs 32 --fat 1  --calories 200 | json_id)
CASARECCE=$(  $FOOD catalog add --name "Casarecce Pasta"           --brand "Rao's"      --serving-size-g 56  --protein 7  --carbs 32 --fat 1  --calories 200 | json_id)
TORTILLA=$(   $FOOD catalog add --name "Corn Wheat Tortillas"      --brand "La Tortilla Factory" --serving-size-g 45 --protein 4 --carbs 18 --fat 2 --calories 105 | json_id)
BRIOCHE=$(    $FOOD catalog add --name "Brioche Hot Dog Buns"      --brand "WFM"        --serving-size-g 60  --protein 3  --carbs 22 --fat 3  --calories 130 | json_id)
FIRESOUR=$(   $FOOD catalog add --name "Fire Sourdough"            --brand "WFM"        --serving-size-g 60  --protein 4  --carbs 18 --fat 1  --calories 100 | json_id)
HIPPEAS=$(    $FOOD catalog add --name "Chickpea Puffs"            --brand "HIPPEAS"    --serving-size-g 22  --protein 3  --carbs 14 --fat 4  --calories 100 | json_id)
HOTHUMMUS=$(  $FOOD catalog add --name "Hot Honey Hummus"          --brand "Cedar's"    --serving-size-g 28  --protein 2  --carbs 9  --fat 5  --calories 90  | json_id)

echo "  Done. Key IDs: OATS=$OATS ISOPURE=$ISOPURE PB=$PB EGGS=$EGGS PAVBHAJI=$PAVBHAJI"

# ─── Grocery run: Mar 22 ──────────────────────────────────────────────────────
# Source: W13 pantry snapshot ("Everything currently available" as of Mar 22/23)
# NOTE: Mar 14 W11 run ($150.06) is in archive — add here once found.
echo "→ Grocery run: Mar 22 (W12, \$116.06) — from W13 pantry snapshot..."

$FOOD pantry add --catalog-id "$ISOPURE"    --servings 10  --notes "Mar 22 run"
$FOOD pantry add --catalog-id 4             --servings 8   --notes "Mar 22 run — 1 carton milk"
$FOOD pantry add --catalog-id "$OATS"       --servings 5   --notes "Mar 22 run"
$FOOD pantry add --catalog-id 12            --servings 11  --notes "Mar 22 run — Protein Pancake Mix"
$FOOD pantry add --catalog-id 15            --servings 4   --notes "Mar 22 run — Impossible Nuggets"
$FOOD pantry add --catalog-id 11            --servings 6   --notes "Mar 22 run — Marinated Mozzarella"
$FOOD pantry add --catalog-id "$YOGVAN"     --servings 6   --notes "Mar 22 run — 2 tubs vanilla yogurt"
$FOOD pantry add --catalog-id 13            --servings 8   --notes "Mar 22 run — Pistachios bag"
$FOOD pantry add --catalog-id 14            --servings 2   --notes "Mar 22 run — 2 RXBARs"
$FOOD pantry add --catalog-id 7             --servings 2   --notes "Mar 22 run — Teriyaki tofu 1 pack"
$FOOD pantry add --catalog-id "$RICOTTA"    --servings 8   --notes "Mar 22 run — Whole Milk Ricotta"
$FOOD pantry add --catalog-id 9             --servings 6   --notes "Mar 22 run — Babybel net of 6"
$FOOD pantry add --catalog-id 3             --servings 6   --notes "Mar 22 run — Hard cooked eggs pouch"
$FOOD pantry add --catalog-id "$EGGS"       --servings 18  --notes "Mar 22 run — Vital Farms raw eggs"
$FOOD pantry add --catalog-id "$ALMONDS"    --servings 3   --notes "Mar 22 run"
$FOOD pantry add --catalog-id "$HEMP"       --servings 14  --notes "Mar 22 run — hemp seeds bag"
$FOOD pantry add --catalog-id "$CHIA"       --servings 14  --notes "Mar 22 run — chia seeds bag"
$FOOD pantry add --catalog-id 6             --servings 10  --notes "Mar 22 run — Chili Onion Hummus"
$FOOD pantry add --catalog-id "$VEGSAUS"    --servings 3   --notes "Mar 22 run — Veg Italian Sausage"
$FOOD pantry add --catalog-id "$NAAN"       --servings 4   --notes "Mar 22 run — Garlic Naan pkg"
$FOOD pantry add --catalog-id "$BANANA"     --servings 3   --notes "Mar 22 run"
$FOOD pantry add --catalog-id "$PB"         --servings 10  --notes "Mar 22 run"
$FOOD pantry add --catalog-id "$GRANGINGER" --servings 5   --notes "Mar 22 run — Granola Ginger Almond"

# ─── Grocery run: Mar 29 ──────────────────────────────────────────────────────
# Source: W14 pantry snapshot — new/unopened items not in W13
echo "→ Grocery run: Mar 29 (Whole Foods) — new items from W14 pantry snapshot..."

$FOOD pantry add --catalog-id "$NANCYYOG"   --servings 8   --notes "Mar 29 WF run — 2 tubs Nancy's yogurt"
$FOOD pantry add --catalog-id "$FIVESPICE"  --servings 2.5 --notes "Mar 29 WF run — Jenny's Five Spice Tofu 8oz"
$FOOD pantry add --catalog-id "$SEITAN"     --servings 3   --notes "Mar 29 WF run — Upton's Chorizo Seitan 8oz"
$FOOD pantry add --catalog-id "$FETA"       --servings 6   --notes "Mar 29 WF run — 365 Feta Crumbles 6oz"
$FOOD pantry add --catalog-id "$PARMESAN"   --servings 14  --notes "Mar 29 WF run — Mitica Parmigiano ~0.87lb"
$FOOD pantry add --catalog-id "$CKPASTA"    --servings 2   --notes "Mar 29 WF run — Lazy Food Chickpea Pasta"
$FOOD pantry add --catalog-id "$FUSILLI"    --servings 8   --notes "Mar 29 WF run — Severino Fusilli 9oz"
$FOOD pantry add --catalog-id "$CASARECCE"  --servings 8   --notes "Mar 29 WF run — Rao's Casarecce 16oz"
$FOOD pantry add --catalog-id "$TORTILLA"   --servings 6   --notes "Mar 29 WF run — La Tortilla Factory 6ct"
$FOOD pantry add --catalog-id "$BRIOCHE"    --servings 6   --notes "Mar 29 WF run — WFM Brioche Hot Dog Buns"
$FOOD pantry add --catalog-id "$FIRESOUR"   --servings 6   --notes "Mar 29 WF run — WFM Fire Sourdough half loaf"
$FOOD pantry add --catalog-id "$HIPPEAS"    --servings 6   --notes "Mar 29 WF run — HIPPEAS 6-pack"
$FOOD pantry add --catalog-id "$HOTHUMMUS"  --servings 6   --notes "Mar 29 WF run — Cedar's Hot Honey Hummus"
$FOOD pantry add --catalog-id 14            --servings 1   --notes "Mar 29 WF run — RXBAR Blueberry restock"
$FOOD pantry add --catalog-id "$VEGSAUS"    --servings 3   --notes "Mar 29 WF run — Veg Italian Sausage restock"
$FOOD pantry add --catalog-id "$EGGS"       --servings 18  --notes "Mar 29 WF run — Vital Farms raw eggs 18ct"
$FOOD pantry add --catalog-id 3             --servings 4   --notes "Mar 29 WF run — Hard cooked eggs"
$FOOD pantry add --catalog-id 12            --servings 9   --notes "Mar 29 WF run — Protein Pancake Mix restock"
$FOOD pantry add --catalog-id 15            --servings 3   --notes "Mar 29 WF run — Impossible Nuggets restock"

echo "✓ Grocery runs done. Run week scripts next: bash logs/w11.sh, etc."
