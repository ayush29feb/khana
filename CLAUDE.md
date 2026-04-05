# Khana — Claude Operating Guide

All CLI commands run from `/Users/ayush29feb/.openclaw/food-tracker/cli/`:

```bash
khana <command>
# or
python3 -m food_tracker.main <command>
```

Data is stored at `~/.openclaw/food-tracker/data/food.db`.  
Images are stored at `~/.openclaw/food-tracker/data/images/{meals|catalog}/{id}.jpg`.

---

## Workflow: Adding a New Food Item

### Step 1 — Add to catalog

Use this when encountering a food for the first time (new brand, new product).

```bash
python3 -m food_tracker.main catalog add \
  --name "Pistachios" \
  --brand "Trader Joe's" \
  --serving-size-g 30 \
  --protein 6 \
  --carbs 8 \
  --fat 14 \
  --calories 170
```

- `--calories` is optional (auto-calculated from macros if omitted)
- `--label-photo PATH` attaches a nutrition label photo at creation time
- `--health-notes` for allergens, processing notes, etc.

### Step 2 — Add to pantry

After buying a product, log the inventory. **Always confirm the number of servings before running** — read the "servings per container" from the label and ask the user.

```bash
python3 -m food_tracker.main pantry add \
  --catalog-id <ID> \
  --servings <N>     # servings per container, e.g. 8 for a full bag
```

---

## Workflow: Logging a Meal

### Home-cooked meal (`add-home`)

Use when ingredients come from pantry items. Automatically deducts from pantry.  
`--ingredient` can be repeated for multiple ingredients. Format: `CATALOG_ID:SERVINGS`.

```bash
python3 -m food_tracker.main meal add-home \
  --name "Yogurt Bowl" \
  --ingredient "12:2.8" \   # catalog ID 12, 2.8 servings
  --ingredient "37:1" \
  --ingredient "22:0.46"
```

- Look up catalog IDs first with: `python3 -m food_tracker.main catalog list`
- Servings can be fractional (e.g. `0.46` for 11g of a 24g-per-serving item: 11/24 ≈ 0.46)
- `--is-estimate` flag when macros are approximate
- `--photo PATH` to attach a meal photo

### Restaurant meal (`add-restaurant`)

Use for meals eaten out — no pantry deduction, macros entered manually.

```bash
python3 -m food_tracker.main meal add-restaurant \
  --name "Chipotle Bowl" \
  --protein 52 \
  --carbs 80 \
  --fat 20 \
  --calories 720 \
  --is-estimate
```

---

## Workflow: Reading a Nutrition Label (Image)

When the user shares a photo of a nutrition label:

1. **Read the image** using the Read tool on the file path
2. **Extract values**: servings per container, serving size (g), calories, total fat (g), total carbs (g), protein (g)
3. **Confirm with the user** before writing anything — state what you read and ask for confirmation
4. **Watch for common misreads**: protein and fat are easy to swap; carbs may show dietary fiber separately (use Total Carbohydrate, not net carbs)
5. **Update or add** only after explicit user confirmation

If updating an existing catalog entry:

```bash
python3 -m food_tracker.main catalog update <ID> \
  --protein 6 --carbs 2 --fat 4.5 --calories 70
```

Or directly via SQLite for fractional values if the CLI rounds them — **always show the SQL and ask for confirmation before running**:

```bash
sqlite3 ~/.openclaw/food-tracker/data/food.db \
  "UPDATE food_catalog SET fat_per_serving = 4.5 WHERE id = <ID>;"
```

---

## Serving Size Conversions

When a label shows per-100g values or the user gives a weight, convert:

```
servings = weight_used_g / serving_size_g
```

Example: 11g of chia seeds with 24g serving size → `11/24 = 0.458` servings → use `0.46`

---

## Catalog Lookup

```bash
python3 -m food_tracker.main catalog list
```

Returns all entries with IDs. Use `catalog get <ID>` for a single item.

---

## Dashboard

- **GraphQL server**: `cd server && npm start` (port 4000)
- **Dashboard**: `cd dashboard && npm run dev -- --host` (port 3000, `--host` for Tailscale access)
- After schema changes: `cd dashboard && npm run relay` to regenerate Relay types
- Images proxied through Vite dev server: `/images/*` → `http://localhost:4000`
- Upload endpoint: `POST /upload/{meal|catalog}/{id}` (multipart form, field name `file`)

---

## Confirmation Rules

**Before any write to the database, always present the full entry and ask for confirmation.** No assumptions — every field must be accounted for and visible to the user before executing.

- **Meals**: confirm name, all ingredients (catalog ID + servings), computed macros, timestamp
- **Pantry**: confirm catalog item, servings count (read from label's "servings per container")
- **Catalog add/update**: confirm all fields — name, brand, serving size, protein, carbs, fat, calories
- **Raw SQL**: always show the exact statement and ask before running

**Batched updates**: if the user says they have multiple updates coming, listen to each one in turn without writing anything. Collect all changes, then do a single confirmation showing everything before executing in one go.
