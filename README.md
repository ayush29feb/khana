# Khana

A personal nutrition tracking system designed to be used from your phone via Claude Code. Log meals, track macros, manage your pantry, and view your nutrition data — all through natural conversation.

For architecture, setup, CLI reference, and technical details see [CONTRIBUTING.md](CONTRIBUTING.md).

---

## How it works

Khana runs on your Mac and you interact with it remotely from your phone using two tools:

- **Claude Code** (remote) — you talk to Claude on your phone to log meals, add foods, and query your data. Claude runs the CLI commands on your Mac.
- **Tailscale** — exposes the dashboard running on your Mac to your phone over a private network, so you can open it in your phone's browser.

```
Your phone
  ├── Claude.ai (mobile) ──remote──► Claude Code (Mac) ──► khana CLI ──► food.db
  └── Safari / Chrome ───Tailscale──► Dashboard (localhost:47320)
```

---

## Prerequisites

On your Mac:
- Python 3.11+
- Node.js 20+
- [Claude Code](https://claude.ai/code) installed and logged in
- [Tailscale](https://tailscale.com) installed and connected

On your phone:
- Claude app (iOS or Android) with Claude Code remote access enabled
- Tailscale app installed and connected to the same network

---

## First-time setup

### 1. Set up the project

Open the repo in Claude Code on your Mac:

```bash
cd food-tracker
claude
```

Then ask Claude:

> "Set up Khana for the first time — install dependencies, create the database, and start the servers."

Claude will install all dependencies, create `server/.env`, initialize the database, and start both servers.

### 2. Connect Claude Code to your phone

In the Claude app on your phone, enable **Remote Claude Code access** (Settings → Claude Code). This lets you send messages from your phone that run Claude Code on your Mac — including all the `khana` CLI commands.

### 3. Expose the dashboard via Tailscale

On your Mac, start the dashboard bound to all interfaces:

```bash
cd dashboard
npm run dev -- --host
```

Vite will print your machine's Tailscale IP, e.g.:

```
  ➜  Local:   http://localhost:47320/
  ➜  Network: http://100.x.x.x:47320/
```

On your phone (with Tailscale connected), open `http://100.x.x.x:47320` in your browser. Bookmark it for quick access.

---

## Daily use

With both servers running and Claude Code connected, just open the Claude app on your phone and talk to it:

- **"Log my lunch — grilled chicken bowl with rice and salsa"** — Claude finds the catalog items, calculates macros, confirms, and logs it
- **"I just bought a bag of pistachios"** — share a photo of the label, Claude reads the macros and servings, confirms, then adds to catalog and pantry
- **"How much protein have I had today?"** — Claude queries the database and tells you
- **"Start the servers"** — if they're not running, Claude starts them on your Mac

Then open the dashboard on your phone browser via Tailscale to see your meals, trends, and goal progress visually.

---

## Tips

- Share a photo of a nutrition label directly in the Claude chat — Claude will read all values before adding anything
- Claude always confirms the full entry before writing to the database
- If you have multiple catalog updates, list them all first — Claude will confirm everything at once before executing
- The dashboard date range picker (top-right) filters all views simultaneously
