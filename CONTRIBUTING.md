# Khana — Technical Reference

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
        (all proxied to localhost:47321 by Vite dev server)
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
./setup.sh   # first-time setup (installs uv, syncs deps, inits DB)
```

After setup, run CLI commands with:
```bash
cd cli && uv run khana <command>
```

Or run directly: `cd cli && uv run python -m food_tracker.main`

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

Start the GraphQL server (port 47321):

```bash
cd server
npm run dev        # tsx watch — auto-restarts on changes
# or
npm start          # runs compiled dist/index.js (after npm run build)
```

Start the dashboard (port 47320):

```bash
cd dashboard
npm run dev                  # localhost only
npm run dev -- --host        # bind to all interfaces (for Tailscale / remote access)
```

The Vite dev server proxies `/graphql`, `/images`, and `/upload` to `http://localhost:47321`.

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
cd cli && uv run khana <command> [subcommand] [options]
# or:
cd cli && uv run python -m food_tracker.main <command> [subcommand] [options]
```

### `catalog`

```bash
khana catalog add \
  --name "Greek Yogurt" --brand "Fage" \
  --serving-size-g 227 \
  --protein 18 --carbs 9 --fat 0 --calories 110

khana catalog list
khana catalog get <ID>
khana catalog update <ID> --protein 20 --calories 120
khana catalog delete <ID>
```

### `pantry`

```bash
khana pantry add --catalog-id <ID> --servings <N>   # log a grocery purchase
khana pantry use --catalog-id <ID> --servings <N>   # manual consumption (not via meal)
khana pantry list                                    # current inventory
khana pantry history                                 # full transaction log
```

### `meal`

Home-cooked meals deduct from pantry. Use `--ingredient CATALOG_ID:SERVINGS` (repeatable).

```bash
khana meal add-home \
  --name "Yogurt Bowl" \
  --ingredient "12:2.8" \
  --ingredient "37:1" \
  --ingredient "22:0.46"

khana meal add-restaurant \
  --name "Chipotle Bowl" \
  --protein 52 --carbs 80 --fat 20 --calories 720 \
  --is-estimate

khana meal list
khana meal delete <ID>
```

Servings conversion: `servings = weight_used_g / serving_size_g`  
Example: 11g of chia seeds with 24g serving → `11/24 ≈ 0.46`

### `goal`

```bash
khana goal add \
  --name "April Cut" \
  --start-date 2026-04-01 --end-date 2026-04-30 \
  --protein 160 --carbs 200 --fat 60 --calories 2200

khana goal list
```

---

## Image Support

Photos are stored in `data/images/` and served by the Node server at `/images/{meals|catalog}/{id}.jpg`.

**Via dashboard** (recommended): click any meal or catalog row to expand it, then use the upload button.

**Via CLI** (at creation time):

```bash
khana meal add-home --name "..." --ingredient "..." --photo ~/path/to/photo.jpg
khana catalog add --name "..." --label-photo ~/path/to/label.jpg
```

---

## Updating Landing Page Screenshots

The dashboard section of `docs/index.html` uses real screenshots captured from the running app. When the dashboard UI changes, regenerate them.

### Prerequisites

Both servers must be running (ports 47320 and 47321). If they're not:

```bash
KHANA=$(git rev-parse --show-toplevel)
cd "$KHANA/server" && npm start &> /tmp/khana-server.log &
cd "$KHANA/dashboard" && npm run dev -- --host &> /tmp/khana-dashboard.log &
sleep 3 && lsof -i :47321 -i :47320 | grep LISTEN
```

### Capture screenshots

The capture script lives at `/tmp/khana-screenshot/capture.mjs`. If the temp directory was cleaned up, recreate it:

```bash
mkdir -p /tmp/khana-screenshot && cd /tmp/khana-screenshot
npm init -y && npm install puppeteer
```

Then run:

```bash
cd /tmp/khana-screenshot && node capture.mjs
```

This captures Home, Meals, and Pantry views at iPhone 14 Pro viewport (390×844 @2x) and writes them to `docs/images/{home,meals,pantry}.png`.

### Script contents (recreate if lost)

```js
import puppeteer from 'puppeteer';
import { mkdir } from 'fs/promises';
import path from 'path';

const KHANA = process.env.KHANA;
if (!KHANA) throw new Error('KHANA environment variable is not set');
const OUT = path.join(KHANA, 'docs/images');
await mkdir(OUT, { recursive: true });

const browser = await puppeteer.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu'],
});

const page = await browser.newPage();
await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });

// App uses a swipe carousel (no URL routing) — click tab buttons to navigate
await page.goto('http://localhost:47320', { waitUntil: 'networkidle2', timeout: 20000 });
await new Promise(r => setTimeout(r, 1500));

const tabs = [
  { index: 0, name: 'goals'   },
  { index: 1, name: 'meals'   },
  { index: 2, name: 'pantry'  },
  { index: 3, name: 'catalog' },
];

for (const tab of tabs) {
  await page.evaluate((i) => {
    const btns = document.querySelectorAll('.bottom-nav button');
    if (btns[i]) btns[i].click();
  }, tab.index);
  await new Promise(r => setTimeout(r, 1200));
  await page.screenshot({ path: path.join(OUT, `${tab.name}.png`), fullPage: false });
  console.log(`captured ${tab.name}`);
}

await browser.close();
```

### Commit the updated images

```bash
cd "$(git rev-parse --show-toplevel)"
git add docs/images/
git commit -m "docs: refresh landing page screenshots"
git push
```

---

## Testing

```bash
# CLI tests
cd cli && uv run pytest

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
