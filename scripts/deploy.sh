#!/usr/bin/env bash
set -euo pipefail

# The one way to deploy jimmypark.net.
#
# It publishes the committed state of `main`, never the working folder, and it
# always carries the KOTMA static export under /kotma. A plain
# `wrangler pages deploy .` uploads whatever happens to be in the folder
# (unfinished work, files a sync client removed) and deletes /kotma.
#
#   scripts/deploy.sh              deploy origin/main + KOTMA export
#   DRY_RUN=1 scripts/deploy.sh    build the staging folder and stop
#   KOTMA_BUILD=1 scripts/deploy.sh   rebuild the KOTMA export first
#
# KOTMA_OUT   existing KOTMA export (default: $KOTMA_ROOT/apps/web/out)
# KOTMA_ROOT  KOTMA checkout     (default: ~/Desktop/VS_Code/KOTMA)

ROOT="$(git rev-parse --show-toplevel)"
cd "$ROOT"
KOTMA_ROOT="${KOTMA_ROOT:-$HOME/Desktop/VS_Code/KOTMA}"
KOTMA_OUT="${KOTMA_OUT:-$KOTMA_ROOT/apps/web/out}"
STAGING_DIR="$(mktemp -d "${TMPDIR:-/tmp}/jimmypark-net-release.XXXXXX")"
fail() { echo "deploy stopped: $*" >&2; exit 1; }

case "$ROOT" in
  "$HOME/Desktop"/*|"$HOME/Documents"/*|*"/Mobile Documents/"*)
    fail "this checkout is inside a cloud-synced folder ($ROOT). Deploy from ~/Developer/jimmypark-net." ;;
esac

branch="$(git rev-parse --abbrev-ref HEAD)"
[[ "$branch" == "main" ]] || fail "current branch is '$branch'. Switch to main."
[[ -z "$(git status --porcelain)" ]] || fail "uncommitted or untracked files are present. Commit them or move them to a branch first."
git fetch --quiet origin main
[[ "$(git rev-parse HEAD)" == "$(git rev-parse origin/main)" ]] || fail "local main differs from origin/main. Pull or push first."

# Committed files only.
git archive HEAD | tar -x -C "$STAGING_DIR"
# Development-only material is not uploaded.
rm -rf "$STAGING_DIR/.checks" "$STAGING_DIR/.impeccable" "$STAGING_DIR/design" "$STAGING_DIR/scripts" \
       "$STAGING_DIR/.env.example" "$STAGING_DIR/.gitignore" "$STAGING_DIR/VERSION"
find "$STAGING_DIR" -maxdepth 1 -name '*.md' -delete

if [[ "${KOTMA_BUILD:-0}" == "1" ]]; then
  [[ -f "$KOTMA_ROOT/apps/web/package.json" ]] || fail "KOTMA project not found at $KOTMA_ROOT."
  npm --prefix "$KOTMA_ROOT/apps/web" run build
fi
[[ -f "$KOTMA_OUT/index.html" ]] || fail "KOTMA export not found at $KOTMA_OUT. Deploying without it would delete /kotma. Set KOTMA_OUT or run with KOTMA_BUILD=1."
mkdir -p "$STAGING_DIR/kotma"
# A cloud-synced KOTMA folder can hold conflict copies such as "page 2.html". They are
# never part of the export, so they are left out; any unreadable file stops the deploy.
rsync -a --delete --exclude '.DS_Store' --exclude '* [2-9].*' "$KOTMA_OUT/" "$STAGING_DIR/kotma/" \
  || fail "the KOTMA export could not be read completely (is it still downloading from iCloud?). Nothing was deployed."
[[ -z "$(find "$STAGING_DIR/kotma" -type f -size 0 -name '*.html' -print -quit)" ]] || fail "the KOTMA export contains empty pages."

for required in index.html insights.html _headers wrangler.toml functions/_middleware.js kotma/index.html assets/site.css; do
  [[ -s "$STAGING_DIR/$required" ]] || fail "staging is missing $required."
done
echo "Staged $(git rev-parse --short HEAD) (v$(cat VERSION)) + KOTMA export at $STAGING_DIR"

if [[ "${DRY_RUN:-0}" == "1" ]]; then
  echo "DRY_RUN=1: nothing was deployed."
  exit 0
fi

# Wrangler compiles Functions from the directory it runs in, so run it inside
# the staging folder rather than passing the folder as an argument from here.
( cd "$STAGING_DIR" && wrangler pages deploy . --project-name jimmypark-net --branch main --commit-dirty=true )

echo "Checking the live site..."
status() { curl -s -o /dev/null -w '%{http_code}' "$@"; }
# A new deployment takes a few seconds to reach every edge location, so each check
# is retried before it counts as a failure.
check() {
  local got attempt
  for attempt in 1 2 3 4 5 6; do
    got="$(status "${@:3}")"
    [[ "$got" == "$2" ]] && { echo "  ok   $1 → $got"; return; }
    sleep 5
  done
  echo "  FAIL $1 → $got (expected $2)"; bad=1
}
bad=0
check "/"                200 https://jimmypark.net/
check "/api/content"     200 https://jimmypark.net/api/content
check "/insights"        200 https://jimmypark.net/insights
check "/insights (HEAD)" 200 -I https://jimmypark.net/insights
check "/insights/feed.xml" 200 https://jimmypark.net/insights/feed.xml
check "/sitemap.xml"     200 https://jimmypark.net/sitemap.xml
check "/kotma/"          200 https://jimmypark.net/kotma/
check "/saju"            200 https://jimmypark.net/saju
check "/api/enquiry"     200 https://jimmypark.net/api/enquiry
check "/api/posts"       401 https://jimmypark.net/api/posts
check "/.env.example"    404 https://jimmypark.net/.env.example
check "/VERSION"         404 https://jimmypark.net/VERSION
[[ "$bad" == "0" ]] || fail "the deployment finished but one or more live checks failed. Review the lines marked FAIL."
echo "Deployed and verified."
