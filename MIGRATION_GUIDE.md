# Running the API Token Migration

This guide helps you apply the API token migration to your database.

## Quick Start

### Option 1: Using the Migration Script (Recommended)

```bash
# Run the migration script
./scripts/run-migration.sh
```

The script will:
- ✅ Verify your configuration
- ✅ Check migration status
- ✅ Apply the migration
- ✅ Verify the table was created

### Option 2: Manual Migration

If you prefer to run the migration manually:

```bash
# Make sure you have .env.local with your database credentials
# DATABASE_URL=postgresql://user:password@host:6543/database?pgbouncer=true
# DIRECT_URL=postgresql://user:password@host:5432/database

# Run the migration
npx prisma@4.15.0 migrate deploy
```

## Prerequisites

Before running the migration, ensure:

1. **.env.local is configured** with your database credentials:
   ```env
   DATABASE_URL=postgresql://user:password@host:6543/database?pgbouncer=true
   DIRECT_URL=postgresql://user:password@host:5432/database
   ```

2. **Database is accessible** from your environment

3. **You have the correct Prisma version** (4.15.0, as specified in package.json)

## What This Migration Does

The `0002_add_api_tokens` migration creates:

- **ApiToken table** with the following structure:
  - `id` (TEXT, primary key)
  - `userId` (TEXT, foreign key to User)
  - `name` (TEXT)
  - `tokenHash` (TEXT, unique)
  - `lastUsedAt` (TIMESTAMP, nullable)
  - `createdAt` (TIMESTAMP)
  - `revokedAt` (TIMESTAMP, nullable)

- **Indexes**:
  - Unique index on `tokenHash`
  - Index on `userId`

- **Foreign Key**: Links to User table with CASCADE delete

## Verifying the Migration

After running the migration, verify it worked:

### 1. Check Migration Status
```bash
npx prisma@4.15.0 migrate status
```

Expected output:
```
Database schema is up to date!
```

### 2. Check the Table in Database

Using Prisma Studio:
```bash
npx prisma@4.15.0 studio
```

Then navigate to the "ApiToken" table.

Or using SQL:
```sql
SELECT * FROM information_schema.tables WHERE table_name = 'ApiToken';
```

### 3. Test the API

Start your development server:
```bash
npm run dev
```

Navigate to:
```
http://localhost:3000/settings
```

You should see the API Token management interface.

## Troubleshooting

### "Cannot find module 'prisma/config'"

This happens when npx tries to use Prisma 7.x instead of 4.15.0. Always specify the version:
```bash
npx prisma@4.15.0 migrate deploy
```

### "Can't reach database server"

1. Verify your DATABASE_URL in .env.local
2. Check if your database is running
3. Verify network connectivity
4. For Supabase, ensure you're using the connection pooler port (6543) for DATABASE_URL

### "Environment variable not found: DIRECT_URL"

Add DIRECT_URL to your .env.local:
```env
DIRECT_URL=postgresql://user:password@host:5432/database
```

Note: Use port 5432 (direct connection) for DIRECT_URL, not 6543.

### "Migration failed"

1. Check the error message for details
2. Ensure the User table exists (from migration 0001)
3. Verify you have the necessary database permissions
4. Check that no conflicting tables exist

## Production Deployment

For production environments:

```bash
# Set environment variables
export DATABASE_URL="your_production_database_url"
export DIRECT_URL="your_production_direct_url"

# Run migration
npx prisma@4.15.0 migrate deploy
```

Or use your CI/CD pipeline. See `.github/workflows/` for examples.

## Rollback (If Needed)

If you need to rollback this migration:

```sql
-- Drop the table and its constraints
DROP TABLE IF EXISTS "ApiToken" CASCADE;
```

Then update your migration history:
```bash
npx prisma@4.15.0 migrate resolve --rolled-back 0002_add_api_tokens
```

## Next Steps

After successfully running the migration:

1. ✅ Restart your development server
2. ✅ Visit http://localhost:3000/settings
3. ✅ Create your first API token
4. ✅ Test it with the example script: `node examples/test-api-token.js`

See `TESTING_API_TOKENS.md` for comprehensive testing instructions.
