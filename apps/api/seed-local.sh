#!/bin/bash
# Seed the local Wrangler R2 bucket with data from the pipeline output.
# Usage: ./seed-local.sh [path-to-output]

DATA_DIR="${1:-../../packages/data-pipeline/output}"

if [ ! -f "$DATA_DIR/grid.json" ]; then
  echo "Error: grid.json not found in $DATA_DIR"
  echo "Run 'pnpm --filter @antipodal/data-pipeline mock' first."
  exit 1
fi

echo "Seeding local R2 from $DATA_DIR"

echo "  grid.json"
npx wrangler r2 object put antipodal-data/grid.json --file="$DATA_DIR/grid.json" --local 2>/dev/null

echo "  summary.json"
npx wrangler r2 object put antipodal-data/summary.json --file="$DATA_DIR/summary.json" --local 2>/dev/null

COUNT=0
TOTAL=$(ls "$DATA_DIR/months/"*.json 2>/dev/null | wc -l | tr -d ' ')
echo "  $TOTAL monthly files..."

for file in "$DATA_DIR/months/"*.json; do
  filename=$(basename "$file")
  npx wrangler r2 object put "antipodal-data/months/$filename" --file="$file" --local 2>/dev/null
  COUNT=$((COUNT + 1))
  if [ $((COUNT % 100)) -eq 0 ]; then
    echo "    $COUNT/$TOTAL"
  fi
done

echo "Done. Seeded $COUNT monthly files + grid.json + summary.json"
