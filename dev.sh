#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
INSTANCE="${1:-0}"
CLIENT_PORT=$((3000 + INSTANCE))
SERVER_PORT=$((8000 + INSTANCE))

echo "Starting instance $INSTANCE — client :$CLIENT_PORT → server :$SERVER_PORT"

# Start server
(cd "$SCRIPT_DIR/server" && PORT=$SERVER_PORT uv run python3 -m uvicorn main:app --reload --port "$SERVER_PORT") &
SERVER_PID=$!

# Start client
(cd "$SCRIPT_DIR/client" && VITE_PORT=$CLIENT_PORT VITE_SERVER_PORT=$SERVER_PORT npm run dev) &
CLIENT_PID=$!

cleanup() {
    echo ""
    echo "Shutting down..."
    kill "$CLIENT_PID" "$SERVER_PID" 2>/dev/null
    wait "$CLIENT_PID" "$SERVER_PID" 2>/dev/null
}
trap cleanup SIGINT SIGTERM

wait
