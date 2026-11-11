#!/usr/bin/env bash
set -euo pipefail
# Kept for older notes that name this file. It now runs the single deploy
# script with a fresh KOTMA build; see scripts/deploy.sh.
KOTMA_BUILD=1 exec "$(dirname "$0")/deploy.sh" "$@"
