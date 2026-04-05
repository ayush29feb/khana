# Khana — Claude Operating Guide

## First-Time Setup

When a user says "help me set up Khana for the first time" (or similar), walk them through the following steps in order, one at a time. Don't dump everything at once — guide them conversationally. **Never ask the user to run commands — always ask for permission and run them yourself.**

### Step 1 — Install dependencies

Ask the user: "Can I run the setup script to install dependencies and initialize the database?"

Once they confirm, run:

```bash
./setup.sh
```

This script installs uv (Python package manager), all Python and Node dependencies, builds the server, creates `server/.env` with the correct database path, and initializes the database. It works regardless of where the repo was cloned.

Tell the user: **Dependencies installed and database created.**

---

### Step 2 — Start the servers

**Before starting**, check if anything is already running on the Khana ports by running:

```bash
lsof -ti :47321 -ti :47320
```

If any PIDs are returned, ask the user: "There are already processes running on Khana's ports (47321 and/or 47320) — likely a previous Khana session. Can I kill them and start fresh?" Only proceed to kill after the user confirms:

```bash
lsof -ti :47321 -ti :47320 | xargs kill -9 2>/dev/null || true
```

Then ask: "Can I start the GraphQL server and dashboard now?" Once confirmed, run:

```bash
KHANA=$(git rev-parse --show-toplevel)
cd "$KHANA/server" && npm start &> /tmp/khana-server.log &
cd "$KHANA/dashboard" && npm run dev -- --host &> /tmp/khana-dashboard.log &
sleep 3 && lsof -i :47321 -i :47320 | grep LISTEN
```

Tell the user: **Both servers are running.**
- GraphQL server: `http://localhost:47321/graphql`
- Dashboard: `http://localhost:47320` (also accessible on your phone — see next step)

---

### Step 3 — Set up remote access on your phone

Tell the user:

> To control Khana from your phone, you need to enable remote access in the Claude app:
> 1. Open the Claude app on your phone
> 2. Go to **Settings → Claude Code**
> 3. Enable **Remote access**
>
> Once enabled, messages you send from your phone will run Claude Code on this Mac — including all the Khana commands.

Wait for them to confirm before continuing.

---

### Step 4 — Set up Tailscale (dashboard on phone)

Tell the user:

> To open the dashboard in your phone's browser, you need Tailscale — a free tool that creates a private connection between your Mac and phone.
>
> **On your Mac:**
> - Install Tailscale: `brew install --cask tailscale` or download from tailscale.com
> - Open it from the menu bar and sign in (free account)
>
> **On your phone:**
> - Install the Tailscale app (App Store / Play Store)
> - Sign in with the same account and toggle it on
>
> Once both devices show as connected, run this to find your Mac's IP:
> ```bash
> tailscale ip -4
> ```
> Then open `http://<that-ip>:47320` in your phone's browser. Bookmark it.

---

### Step 5 — Done

Tell the user:

> **Khana is ready.** Here's how to use it going forward:
>
> - **Log food**: just tell me what you ate, bought, or cooked — from your phone or here
> - **Check your dashboard**: open the Tailscale URL in your phone browser
> - **If servers stop**: say "start the servers" and I'll restart them
>
> Want to set up a first goal, or start logging something?

---

## Key Paths

All paths are relative to the repo root (wherever you cloned it). Run `git rev-parse --show-toplevel` to find it.

| Resource | Relative Path |
|---|---|
| Database | `data/food.db` |
| Images | `data/images/{meals\|catalog}/{id}.jpg` |
| CLI | `cli/` |
| Server | `server/` |
| Dashboard | `dashboard/` |
| Server env | `server/.env` |

---

## Running the Servers

### Start both servers

**Never ask the user to run commands — always ask for permission and run them yourself.**

**First, check for and kill any existing processes on Khana's ports** (ask user for confirmation if any are found — see Step 2 in First-Time Setup for the exact wording):

```bash
lsof -ti :47321 -ti :47320 | xargs kill -9 2>/dev/null || true
```

Then start:

```bash
KHANA=$(git rev-parse --show-toplevel)
cd "$KHANA/server" && npm start &> /tmp/khana-server.log &
cd "$KHANA/dashboard" && npm run dev -- --host &> /tmp/khana-dashboard.log &
sleep 2 && lsof -i :47321 -i :47320 | grep LISTEN
```

### Check if running

```bash
lsof -i :47321 -i :47320 | grep LISTEN
```

### View logs

```bash
tail -f /tmp/khana-server.log
tail -f /tmp/khana-dashboard.log
```

### Kill servers

```bash
pkill -f "node dist/index.js"
pkill -f "tsx watch src/index"
pkill -f "vite"
```

### If user asks to start from their phone

They should type in the Claude chat (the `!` prefix runs it directly in the session terminal):

```
! lsof -ti :47321 -ti :47320 | xargs kill -9 2>/dev/null || true
! KHANA=$(git rev-parse --show-toplevel) && cd "$KHANA/server" && npm start &> /tmp/khana-server.log &
! KHANA=$(git rev-parse --show-toplevel) && cd "$KHANA/dashboard" && npm run dev -- --host &> /tmp/khana-dashboard.log &
```

---

## CLI

```bash
# From anywhere in the repo:
cd cli && uv run khana <command>

# Or use the full path pattern:
KHANA=$(git rev-parse --show-toplevel) && cd "$KHANA/cli" && uv run khana <command>
```

---

## Tailscale

```bash
tailscale ip -4   # find Mac's Tailscale IP
```

Dashboard URL on phone: `http://<tailscale-ip>:47320`

The `--host` flag on Vite is required — without it Vite only binds to localhost and the phone can't reach it.

---

## Workflow: Adding a New Food Item

### Step 1 — Add to catalog

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

```bash
khana pantry add \
  --catalog-id <ID> \
  --servings <N>
```

**Always confirm servings count before running** — read "servings per container" from the label and ask the user.

---

## Workflow: Logging a Meal

### Home-cooked meal (`add-home`)

```bash
khana meal add-home \
  --name "Yogurt Bowl" \
  --ingredient "12:2.8" \
  --ingredient "37:1" \
  --ingredient "22:0.46"
```

- `--ingredient` format: `CATALOG_ID:SERVINGS`
- Servings can be fractional: `servings = weight_used_g / serving_size_g`
- `--is-estimate` flag when macros are approximate
- `--photo PATH` to attach a meal photo

### Restaurant meal (`add-restaurant`)

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

1. **Read the image** using the Read tool on the file path
2. **Extract**: servings per container, serving size (g), calories, total fat (g), total carbs (g), protein (g)
3. **Confirm with the user** before writing — state every value and ask
4. **Watch for misreads**: protein and fat are easy to swap; always use Total Carbohydrate (not net carbs)

If updating an existing catalog entry:

```bash
khana catalog update <ID> --protein 6 --carbs 2 --fat 4.5 --calories 70
```

---

## Confirmation Rules

**Before any write to the database, always present the full entry and ask for confirmation.**

- **Meals**: confirm name, all ingredients (catalog item name + servings), computed macros, timestamp
- **Pantry**: confirm catalog item name, serving count
- **Catalog add/update**: confirm all fields — name, brand, serving size, protein, carbs, fat, calories
- **Raw SQL**: always show the exact statement and ask before running

**Batched updates**: if the user says they have multiple updates coming, listen to each one in turn without writing anything. Collect all changes, then do a single confirmation before executing.

---

## Common Problems & Fixes

### Server starts but returns no data

Check `server/.env` — `DATABASE_URL` must be `file:///absolute/path/to/data/food.db`. A relative path silently creates a new empty DB.

### Dashboard blank / `GoalsViewQuery` Unexpected error

The database file exists but has no tables. Fix by re-running the CLI init (which creates tables via SQLAlchemy) then restarting the server:

```bash
KHANA=$(git rev-parse --show-toplevel)
cd "$KHANA/cli" && KHANA="$KHANA" uv run khana catalog list > /dev/null
```

Then restart the server.

### `uv: command not found`

Ask permission then run `./setup.sh` again — it installs uv. Or ask permission to run: `brew install uv`

### `khana: command not found`

Run khana via uv from the cli directory:
```bash
KHANA=$(git rev-parse --show-toplevel) && cd "$KHANA/cli" && uv run khana <command>
```

### Dashboard blank screen

Usually a JS error. Check browser console. Common causes:
- Relay types out of date: `cd dashboard && npm run relay`
- GraphQL field not in `dashboard/schema.graphql` — add it, then run `npm run relay`

### `prisma generate` needed

If Prisma schema changed:

```bash
KHANA=$(git rev-parse --show-toplevel)
cd "$KHANA/server" && npx prisma generate && npm run build
```

### Port already in use

```bash
lsof -i :47321 -i :47320 | grep LISTEN   # find what's on Khana's ports
kill -9 <PID>
```

---

## Updating Landing Page Screenshots

When the dashboard UI changes, regenerate `docs/images/`:

```bash
mkdir -p /tmp/khana-screenshot && cd /tmp/khana-screenshot
npm init -y && npm install puppeteer
node capture.mjs
```

Script (`/tmp/khana-screenshot/capture.mjs`):

```js
import puppeteer from 'puppeteer';
import { mkdir } from 'fs/promises';
import path from 'path';

const KHANA = process.env.KHANA;
if (!KHANA) throw new Error('KHANA environment variable is not set');
const OUT = path.join(KHANA, 'docs/images');
await mkdir(OUT, { recursive: true });

const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
const page = await browser.newPage();
await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });

const routes = [
  { path: '/goals',   name: 'goals'   },
  { path: '/meals',   name: 'meals'   },
  { path: '/pantry',  name: 'pantry'  },
  { path: '/catalog', name: 'catalog' },
];

for (const route of routes) {
  await page.goto(`http://localhost:47320${route.path}`, { waitUntil: 'networkidle0', timeout: 15000 });
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: path.join(OUT, `${route.name}.png`), fullPage: false });
  console.log(`captured ${route.name}`);
}

await browser.close();
```

Then commit:

```bash
KHANA=$(git rev-parse --show-toplevel)
cd "$KHANA" && git add docs/images/
git commit -m "docs: refresh landing page screenshots"
git push
```
