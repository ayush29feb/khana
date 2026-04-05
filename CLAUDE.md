# Khana — Claude Operating Guide

## Key Paths

| Resource | Path |
|---|---|
| Database | `~/.openclaw/food-tracker/data/food.db` |
| Images | `~/.openclaw/food-tracker/data/images/{meals\|catalog}/{id}.jpg` |
| CLI | `~/.openclaw/food-tracker/cli/` |
| Server | `~/.openclaw/food-tracker/server/` |
| Dashboard | `~/.openclaw/food-tracker/dashboard/` |
| Server env | `~/.openclaw/food-tracker/server/.env` |

---

## Running the Servers

### GraphQL server (port 4000)

```bash
cd /Users/ayush29feb/.openclaw/food-tracker/server
npm start   # production build (dist/index.js)
# or
npm run dev # tsx watch — auto-restarts on file changes
```

Run in background: append `&> /tmp/khana-server.log &`

### Dashboard (port 3000)

```bash
cd /Users/ayush29feb/.openclaw/food-tracker/dashboard
npm run dev -- --host   # --host binds to all interfaces for Tailscale access
```

Run in background: append `&> /tmp/khana-dashboard.log &`

### Check if servers are running

```bash
lsof -i :4000   # GraphQL server
lsof -i :3000   # Dashboard
```

### Kill servers

```bash
pkill -f "node dist/index.js"    # production server
pkill -f "tsx watch src/index"   # dev server
pkill -f "vite"                  # dashboard
```

---

## CLI

The CLI requires the Python venv to be active, or use the full path:

```bash
# With venv active (source cli/.venv/bin/activate):
khana <command>

# Without activating venv:
/Users/ayush29feb/.openclaw/food-tracker/cli/.venv/bin/khana <command>

# Always works (no venv needed):
cd /Users/ayush29feb/.openclaw/food-tracker/cli
python3 -m food_tracker.main <command>
```

---

## First-Time Setup

If running Khana on a fresh machine:

### 1. CLI

```bash
cd /Users/ayush29feb/.openclaw/food-tracker/cli
python3 -m venv .venv
source .venv/bin/activate
pip install -e ".[dev]"
```

### 2. Server

```bash
cd /Users/ayush29feb/.openclaw/food-tracker/server
npm install
```

Create `server/.env` if it doesn't exist:

```
DATABASE_URL="file:///Users/ayush29feb/.openclaw/food-tracker/data/food.db"
```

Note: path must be absolute with `file://` prefix. Relative paths will silently create a new DB in the wrong location.

```bash
cd /Users/ayush29feb/.openclaw/food-tracker/server
npm run build   # compile TypeScript to dist/
```

### 3. Dashboard

```bash
cd /Users/ayush29feb/.openclaw/food-tracker/dashboard
npm install
```

### 4. Initialize the database

The database is created automatically by SQLAlchemy the first time any CLI command runs:

```bash
khana catalog list   # creates data/food.db if it doesn't exist
```

---

## Common Problems & Fixes

### Server starts but returns no data / wrong data

The server is probably pointing at the wrong database. Check `server/.env`:

```bash
cat /Users/ayush29feb/.openclaw/food-tracker/server/.env
```

`DATABASE_URL` must be `file:///absolute/path/to/data/food.db`. A relative path silently creates a new empty DB.

### `khana: command not found`

The venv isn't active. Use the full path instead:

```bash
/Users/ayush29feb/.openclaw/food-tracker/cli/.venv/bin/khana <command>
```

Or activate the venv first: `source /Users/ayush29feb/.openclaw/food-tracker/cli/.venv/bin/activate`

### Dashboard shows blank screen / component crash

Usually a JavaScript runtime error. Check the browser console. Common causes:

- **Relay type mismatch**: schema was changed but `npm run relay` wasn't run. Fix: `cd dashboard && npm run relay`
- **Missing import**: e.g. `createPortal` must be imported from `react-dom`, not `react`
- **GraphQL field not in schema**: if adding a new field to a query, it must also be added to `dashboard/schema.graphql` (Relay reads this local file, not the server's SDL)

### GraphQL query returns errors for a new field

The field exists in `server/src/schema.ts` but not in `dashboard/schema.graphql`. Add it to both, then run `npm run relay` in `dashboard/`.

### `prisma generate` needed

If Prisma schema changed (new column, new model), run:

```bash
cd /Users/ayush29feb/.openclaw/food-tracker/server
npx prisma generate
```

Then rebuild: `npm run build`

### Port already in use

```bash
lsof -i :4000 | grep LISTEN   # find what's on port 4000
kill -9 <PID>
```

### Images not loading in dashboard

- Check that the server is running on port 4000 (images are proxied through it)
- Check that the image file exists at `data/images/{meals|catalog}/{id}.jpg`
- The server derives the images root from `DATABASE_URL` — same directory as `food.db`

### `node_modules` missing after pulling changes

```bash
cd server && npm install
cd dashboard && npm install
```

---

## Workflow: Adding a New Food Item

### Step 1 — Add to catalog

Use this when encountering a food for the first time (new brand, new product).

```bash
khana catalog add \
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

After buying a product, log the inventory. **Always confirm the number of servings before running** — read "servings per container" from the label and ask the user.

```bash
khana pantry add \
  --catalog-id <ID> \
  --servings <N>     # servings per container, e.g. 8 for a full bag
```

---

## Workflow: Logging a Meal

### Home-cooked meal (`add-home`)

Use when ingredients come from pantry items. Automatically deducts from pantry.  
`--ingredient` can be repeated for multiple ingredients. Format: `CATALOG_ID:SERVINGS`.

```bash
khana meal add-home \
  --name "Yogurt Bowl" \
  --ingredient "12:2.8" \
  --ingredient "37:1" \
  --ingredient "22:0.46"
```

- Look up catalog IDs first: `khana catalog list`
- Servings can be fractional (e.g. `0.46` for 11g of a 24g-per-serving item: 11/24 ≈ 0.46)
- `--is-estimate` flag when macros are approximate
- `--photo PATH` to attach a meal photo

### Restaurant meal (`add-restaurant`)

Use for meals eaten out — no pantry deduction, macros entered manually.

```bash
khana meal add-restaurant \
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
3. **Confirm with the user** before writing anything — state every value and ask for confirmation
4. **Watch for common misreads**: protein and fat are easy to swap; always use Total Carbohydrate (not net carbs); calories are large and easy to read correctly
5. **Update or add** only after explicit user confirmation

If updating an existing catalog entry:

```bash
khana catalog update <ID> --protein 6 --carbs 2 --fat 4.5 --calories 70
```

Or directly via SQLite for fractional values — **always show the SQL and ask for confirmation before running**:

```bash
sqlite3 ~/.openclaw/food-tracker/data/food.db \
  "UPDATE food_catalog SET fat_per_serving = 4.5 WHERE id = <ID>;"
```

---

## Serving Size Conversions

```
servings = weight_used_g / serving_size_g
```

Example: 11g of chia seeds, 24g per serving → `11 / 24 = 0.458` → use `0.46`

---

## Confirmation Rules

**Before any write to the database, always present the full entry and ask for confirmation.** No assumptions — every field must be visible to the user before executing.

- **Meals**: confirm name, all ingredients (catalog item name + servings), computed macros, timestamp
- **Pantry**: confirm catalog item name, serving count (read "servings per container" from label)
- **Catalog add/update**: confirm all fields — name, brand, serving size, protein, carbs, fat, calories
- **Raw SQL**: always show the exact statement and ask before running

**Batched updates**: if the user says they have multiple updates coming, listen to each one in turn without writing anything. Collect all changes, then do a single confirmation showing everything before executing in one go.
