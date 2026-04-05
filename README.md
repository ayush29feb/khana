# Khana

A personal nutrition tracking system with a CLI for data entry and a web dashboard for visualization. Built around a SQLite database shared between a Python CLI and a Node.js GraphQL server.

For architecture, setup, CLI reference, and technical details see [CONTRIBUTING.md](CONTRIBUTING.md).

---

## Getting Started with Claude Code

The fastest way to get Khana running is to open this repo in Claude Code and just ask. Claude has full context via `CLAUDE.md` and can handle setup, running the servers, logging meals, and updating the catalog from photos.

### 1. Open the project

```bash
cd food-tracker
claude
```

### 2. First-time setup

Ask Claude:

> "Set up Khana for the first time — install dependencies, create the database, and start the servers."

Claude will:
- Install Python dependencies in `cli/.venv`
- Install Node dependencies in `server/` and `dashboard/`
- Create `server/.env` pointing to `data/food.db`
- Initialize the SQLite database
- Start the GraphQL server in the background (port 4000)
- Start the dashboard (port 3000)

### 3. Daily use

Once set up, just ask Claude naturally:

- **"Start the servers"** — Claude starts both in the background
- **"Log my breakfast: 2 eggs and toast"** — Claude looks up catalog IDs, confirms the entry, and logs it
- **"I bought a bag of almonds, add it to the catalog and pantry"** — share a photo of the label and Claude reads it, confirms values, then adds everything
- **"What did I eat this week?"** — Claude queries the database and summarizes
- **"Update the protein on Greek Yogurt to 18g"** — Claude confirms and runs the update

### 4. Dashboard

Open `http://localhost:3000` to see your data visualized. The dashboard is read-only — all data entry goes through Claude + the CLI.

### Tips

- Share a photo of a nutrition label and Claude will read all values from it before adding to the catalog
- Claude always confirms the full entry before writing anything to the database
- If you have multiple updates (e.g. correcting several catalog entries), tell Claude upfront — it will collect all changes and confirm once before executing
