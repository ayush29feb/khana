# Food Tracker

A personal nutrition tracking system with a CLI for data entry and a web dashboard for visualization. Built around a SQLite database shared between a Python CLI and a Node.js GraphQL server.

---

## Architecture

```
food-tracker/
├── cli/          # Python CLI — all data entry
├── server/       # Node.js GraphQL server — reads DB, serves dashboard API + images
├── dashboard/    # React/Relay SPA — visualization
└── data/         # SQLite database + uploaded images (gitignored)
    ├── food.db
    └── images/
        ├── meals/{id}.jpg
        └── catalog/{id}.jpg
```

### How the pieces connect

```
CLI (Python/SQLAlchemy)
    └── writes → data/food.db

GraphQL Server (Node.js/Prisma + graphql-yoga)
    ├── reads → data/food.db  (via DATABASE_URL env var)
    ├── serves → GET /images/*  (static files from data/images/)
    ├── handles → POST /upload/{meal|catalog}/{id}  (image upload)
    └── exposes → POST /graphql

Dashboard (React/Relay/Vite)
    ├── queries → /graphql
    ├── loads images → /images/*
    └── uploads → /upload/*
        (all proxied to localhost:4000 by Vite dev server)
```

The CLI and server never conflict — the CLI only writes, the server only reads (except for image path updates via upload endpoint).

---

## Database Schema

Four tables in `data/food.db`:

| Table | Purpose |
|---|---|
| `food_catalog` | Master list of foods with per-serving macros |
| `pantry_transactions` | Double-entry ledger: `+delta` for grocery adds, `-delta` for meal use |
| `meals` | Logged meals with total macros |
| `goals` | Nutrition goals with date ranges and macro targets |

**Pantry state** is derived: `SUM(delta)` per `catalog_id` across all transactions.  
**Meal ingredients** link meals to pantry transactions (`meal_id` FK on `pantry_transactions`).

---

## Tech Stack

| Layer | Tech |
|---|---|
| CLI | Python 3.11+, Typer, SQLAlchemy 2, SQLite |
| Server | Node.js, TypeScript, graphql-yoga, Prisma 5, Busboy |
| Dashboard | React 18, Relay, Vite, React Router, TypeScript |
| Database | SQLite (single file, no server) |

---

## Setup

### Prerequisites

- Python 3.11+
- Node.js 20+
- npm

### CLI

```bash
cd cli
python3 -m venv .venv
source .venv/bin/activate
pip install -e ".[dev]"
```

After activation, `food` is available as a command. Or run directly with `python3 -m food_tracker.main`.

### Server

```bash
cd server
npm install
cp .env.example .env
# Edit .env: set DATABASE_URL=file:///absolute/path/to/data/food.db
```

### Dashboard

```bash
cd dashboard
npm install
```

---

## Running

### Development

Start the GraphQL server (port 4000):

```bash
cd server
npm run dev        # tsx watch — auto-restarts on changes
# or
npm start          # runs compiled dist/index.js (after npm run build)
```

Start the dashboard (port 3000):

```bash
cd dashboard
npm run dev                  # localhost only
npm run dev -- --host        # bind to all interfaces (for Tailscale / remote access)
```

The Vite dev server proxies `/graphql`, `/images`, and `/upload` to `http://localhost:4000`.

### After schema changes

If you modify the GraphQL schema (`server/src/schema.ts` or `dashboard/schema.graphql`), regenerate Relay types:

```bash
cd dashboard
npm run relay
```

If you modify `server/prisma/schema.prisma`:

```bash
cd server
npx prisma generate
```

---

## Dashboard Views

| View | Route | Description |
|---|---|---|
| Home | `/` | Active goal progress, macro bars, pace indicator |
| Meals | `/meals` | Meals grouped by day, expandable rows with ingredients + photos |
| Pantry | `/pantry` | Current pantry inventory with protein totals |
| Catalog | `/catalog` | Full food catalog, sortable/filterable, with label photo upload |
| Trends | `/trends` | Daily macro breakdown chart over selected date range |

The date range picker (top-right) filters Meals, Home, and Trends simultaneously.

---

## CLI Reference

All commands run from `cli/`:

```bash
python3 -m food_tracker.main <command> [subcommand] [options]
# or, if installed via pip install -e:
food <command> [subcommand] [options]
```

### `catalog`

```bash
food catalog add \
  --name "Greek Yogurt" --brand "Fage" \
  --serving-size-g 227 \
  --protein 18 --carbs 9 --fat 0 --calories 110

food catalog list
food catalog get <ID>
food catalog update <ID> --protein 20 --calories 120
food catalog delete <ID>
```

### `pantry`

```bash
food pantry add --catalog-id <ID> --servings <N>   # log a grocery purchase
food pantry use --catalog-id <ID> --servings <N>   # manual consumption (not via meal)
food pantry list                                    # current inventory
food pantry history                                 # full transaction log
```

### `meal`

Home-cooked meals deduct from pantry. Use `--ingredient CATALOG_ID:SERVINGS` (repeatable).

```bash
food meal add-home \
  --name "Yogurt Bowl" \
  --ingredient "12:2.8" \
  --ingredient "37:1" \
  --ingredient "22:0.46"

food meal add-restaurant \
  --name "Chipotle Bowl" \
  --protein 52 --carbs 80 --fat 20 --calories 720 \
  --is-estimate

food meal list
food meal delete <ID>
```

Servings conversion: `servings = weight_used_g / serving_size_g`  
Example: 11g of chia seeds with 24g serving → `11/24 ≈ 0.46`

### `goal`

```bash
food goal add \
  --name "April Cut" \
  --start-date 2026-04-01 --end-date 2026-04-30 \
  --protein 160 --carbs 200 --fat 60 --calories 2200

food goal list
```

---

## Image Support

Photos are stored in `data/images/` and served by the Node server at `/images/{meals|catalog}/{id}.jpg`.

**Via dashboard** (recommended): click any meal or catalog row to expand it, then use the upload button.

**Via CLI** (at creation time):

```bash
food meal add-home --name "..." --ingredient "..." --photo ~/path/to/photo.jpg
food catalog add --name "..." --label-photo ~/path/to/label.jpg
```

---

## Testing

```bash
# CLI tests
cd cli && pytest

# Server tests
cd server && npm test
```

---

## Data Location

All persistent data lives in `data/` (gitignored):

```
data/
├── food.db              # SQLite database
├── backup/              # manual backups
└── images/
    ├── meals/{id}.jpg
    └── catalog/{id}.jpg
```

The server derives the images path from `DATABASE_URL`: it uses the same directory as the `.db` file. If you move the database, update `server/.env` and the images will follow.
