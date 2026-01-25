#!/bin/bash

# Supabase + Prisma Migration Runner for API Tokens
# This script helps you run the API token migration with Supabase database

set -e  # Exit on error

echo "=========================================="
echo "Supabase + Prisma Migration Runner"
echo "API Token Migration (0002_add_api_tokens)"
echo "=========================================="
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "❌ Error: .env.local file not found"
    echo ""
    echo "Please create .env.local with your Supabase database credentials:"
    echo ""
    echo "Get these from your Supabase project:"
    echo "  1. Go to https://app.supabase.com"
    echo "  2. Select your project"
    echo "  3. Go to Project Settings → Database"
    echo "  4. Copy the connection strings"
    echo ""
    echo "Add to .env.local:"
    echo "  # Connection Pooler (port 6543) - for DATABASE_URL"
    echo "  DATABASE_URL=postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
    echo ""
    echo "  # Direct Connection (port 5432) - for DIRECT_URL (migrations)"
    echo "  DIRECT_URL=postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:5432/postgres"
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
    echo ""
    echo "For Supabase, you need both:"
    echo "  DATABASE_URL - Connection pooler (port 6543)"
    echo "  DIRECT_URL - Direct connection (port 5432) for migrations"
    echo ""
    exit 1
fi

echo "✓ Configuration files found"
echo ""

# Load environment variables
export $(grep -v '^#' .env.local | xargs)

# Check Supabase connection
echo "Testing Supabase connection..."
if echo "$DATABASE_URL" | grep -q "supabase.com"; then
    echo "✓ Detected Supabase database"
else
    echo "⚠️  Warning: This doesn't appear to be a Supabase URL"
    echo "   Expected format: postgresql://...@...supabase.com:..."
fi
echo ""

# Check current migration status
echo "Checking current migration status..."
echo ""
npx prisma@4.15.0 migrate status

echo ""
echo "=========================================="
echo "Running Migration"
echo "=========================================="
echo ""

# Run the migration using DIRECT_URL (port 5432)
echo "Applying migration using direct connection..."
npx prisma@4.15.0 migrate deploy

echo ""
echo "=========================================="
echo "Migration Complete!"
echo "=========================================="
echo ""

# Generate Prisma Client
echo "Generating Prisma Client..."
npx prisma@4.15.0 generate

echo ""
echo "✅ Migration processed successfully!"
echo ""
echo "What was created:"
echo "  ✓ ApiToken table"
echo "  ✓ Indexes on tokenHash and userId"
echo "  ✓ Foreign key to User table"
echo ""
echo "Next steps:"
echo "  1. Restart your development server: npm run dev"
echo "  2. Navigate to http://localhost:3000/settings"
echo "  3. Create your first API token"
echo ""
echo "For testing, see: TESTING_API_TOKENS.md"
echo ""
