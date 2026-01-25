#!/bin/bash

# Migration Runner Script for API Tokens
# This script helps you run the API token migration (0002_add_api_tokens)

set -e  # Exit on error

echo "========================================"
echo "API Token Migration Runner"
echo "========================================"
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "❌ Error: .env.local file not found"
    echo ""
    echo "Please create .env.local with your database credentials:"
    echo "  DATABASE_URL=postgresql://user:password@host:6543/database?pgbouncer=true"
    echo "  DIRECT_URL=postgresql://user:password@host:5432/database"
    echo ""
    exit 1
fi

# Check if DATABASE_URL is set
if ! grep -q "^DATABASE_URL=" .env.local; then
    echo "❌ Error: DATABASE_URL not found in .env.local"
    exit 1
fi

if ! grep -q "^DIRECT_URL=" .env.local; then
    echo "❌ Error: DIRECT_URL not found in .env.local"
    exit 1
fi

echo "✓ Configuration files found"
echo ""

# Check current migration status
echo "Checking current migration status..."
echo ""
npx prisma@4.15.0 migrate status

echo ""
echo "========================================"
echo "Running Migration"
echo "========================================"
echo ""

# Run the migration
npx prisma@4.15.0 migrate deploy

echo ""
echo "========================================"
echo "Migration Complete!"
echo "========================================"
echo ""

# Verify the new table exists
echo "Verifying ApiToken table..."
npx prisma@4.15.0 db execute --stdin <<SQL
SELECT COUNT(*) as api_token_table_exists 
FROM information_schema.tables 
WHERE table_name = 'ApiToken';
SQL

echo ""
echo "✅ Migration processed successfully!"
echo ""
echo "Next steps:"
echo "  1. Restart your development server: npm run dev"
echo "  2. Navigate to http://localhost:3000/settings"
echo "  3. Create your first API token"
echo ""
