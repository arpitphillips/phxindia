#!/usr/bin/env bash
# Full build: compile TypeScript, regenerate placeholders if missing,
# then run the Rust quality gate (link check + sitemap).
set -euo pipefail
cd "$(dirname "$0")/.."

echo "── 1/3 TypeScript ─────────────────────────────"
tsc -p tsconfig.json
echo "ok"

echo "── 2/3 Placeholder assets ─────────────────────"
if [ ! -f site/assets/img/favicon.svg ]; then
  python3 scripts/gen_placeholders.py
else
  echo "present — skipped (run scripts/gen_placeholders.py to regenerate)"
fi

echo "── 3/3 sitecheck (links, tags, sitemap) ───────"
cargo run --quiet --release --manifest-path tools/sitecheck/Cargo.toml -- \
  site --base-url https://phxindia.com --write-sitemap

echo "build complete — deployable root: site/"
