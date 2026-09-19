#!/usr/bin/env bash
set -euo pipefail

# Merge KOTMA's static export under /kotma without replacing the portfolio or its Pages Functions.
ROOT="$(git rev-parse --show-toplevel)"
KOTMA_ROOT="${KOTMA_ROOT:-$HOME/Desktop/VS_Code/KOTMA}"
STAGING_DIR="${TMPDIR:-/tmp}/jimmypark-net-kotma-preview"

if [[ ! -f "$KOTMA_ROOT/apps/web/package.json" ]]; then
  echo "KOTMA project not found at: $KOTMA_ROOT" >&2
  exit 1
fi

rm -rf "$STAGING_DIR"
mkdir -p "$STAGING_DIR"

rsync -a --delete \
  --exclude '.git/' \
  --exclude '.wrangler/' \
  --exclude '.DS_Store' \
  --exclude '.checks/' \
  --exclude '.impeccable/' \
  --exclude 'node_modules/' \
  --exclude '.next/' \
  --exclude '**/node_modules/' \
  --exclude '**/.next/' \
  "$ROOT/" "$STAGING_DIR/"

npm --prefix "$KOTMA_ROOT/apps/web" run build
mkdir -p "$STAGING_DIR/kotma"
rsync -a --delete "$KOTMA_ROOT/apps/web/out/" "$STAGING_DIR/kotma/"

wrangler pages deploy "$STAGING_DIR" --project-name jimmypark-net --branch main
