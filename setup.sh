#!/usr/bin/env bash
set -euo pipefail

KHANA="$(cd "$(dirname "$0")" && pwd)"
echo "Setting up Khana at: $KHANA"

# ── uv ──────────────────────────────────────────────────────────────
if ! command -v uv &>/dev/null; then
  echo "Installing uv..."
  if command -v brew &>/dev/null; then
    brew install uv
  else
    curl -LsSf https://astral.sh/uv/install.sh | sh
    export PATH="$HOME/.local/bin:$PATH"
  fi
fi

# ── Python CLI ───────────────────────────────────────────────────────
echo "Installing Python CLI..."
cd "$KHANA/cli" && uv sync

# ── Node server ──────────────────────────────────────────────────────
echo "Installing server dependencies..."
cd "$KHANA/server" && npm install && npm run build

# ── Dashboard ────────────────────────────────────────────────────────
echo "Installing dashboard dependencies..."
cd "$KHANA/dashboard" && npm install

# ── server/.env ──────────────────────────────────────────────────────
ENV_FILE="$KHANA/server/.env"
mkdir -p "$KHANA/data"
if [ ! -f "$ENV_FILE" ]; then
  echo "Creating server/.env..."
  echo "DATABASE_URL=\"file://$KHANA/data/food.db\"" > "$ENV_FILE"
fi

# ── Relay types ──────────────────────────────────────────────────────
echo "Generating Relay types..."
cd "$KHANA/dashboard" && npm run relay

# ── Init DB ──────────────────────────────────────────────────────────
echo "Initializing database..."
cd "$KHANA/cli" && KHANA="$KHANA" uv run khana catalog list > /dev/null

# ── Verify DB ────────────────────────────────────────────────────────
DB_FILE="$KHANA/data/food.db"
if [ ! -f "$DB_FILE" ]; then
  echo "✗ Database file was not created at $DB_FILE"
  exit 1
fi
TABLES=$(sqlite3 "$DB_FILE" ".tables" 2>/dev/null || true)
for TABLE in food_catalog meals goals pantry_transactions; do
  if ! echo "$TABLES" | grep -qw "$TABLE"; then
    echo "✗ Missing table '$TABLE' in $DB_FILE"
    exit 1
  fi
done

echo ""
echo "✓ Khana is ready."
echo ""
echo "Next: open Claude Code in this directory and say 'start the servers'"
