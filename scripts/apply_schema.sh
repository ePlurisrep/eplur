#!/usr/bin/env bash
set -euo pipefail

# Apply database/schema.sql to the database specified by DATABASE_URL or SUPABASE_DB_URL

DB_URL="${DATABASE_URL:-${SUPABASE_DB_URL:-}}"
if [ -z "$DB_URL" ]; then
  echo "Error: set DATABASE_URL or SUPABASE_DB_URL environment variable to your Supabase DB connection string"
  exit 1
fi

if ! command -v psql >/dev/null 2>&1; then
  echo "Error: psql is required but not installed. Install libpq (psql) and retry."
  exit 1
fi

echo "Applying database/schema.sql to $DB_URL"
psql "$DB_URL" -f database/schema.sql

echo "Schema applied."
