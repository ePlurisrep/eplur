# Quick Migration Commands

## Run the Migration

### For Supabase + Prisma (Recommended)

```bash
# Automated script with Supabase-specific guidance
./scripts/run-supabase-migration.sh
```

### Generic Prisma Migration

```bash
# Make sure .env.local is configured with your database credentials
npm run migrate
```

## Check Migration Status

```bash
npm run migrate:status
```

## View Database Tables

```bash
npm run db:studio
```

## Supabase-Specific Instructions

For detailed Supabase + Prisma setup, see:
- **[SUPABASE_MIGRATION.md](./SUPABASE_MIGRATION.md)** - Complete Supabase guide
- Includes connection string setup
- Troubleshooting for Supabase-specific issues
- Connection pooling configuration

## What Gets Created

This migration adds the `ApiToken` table for API access token management.

For detailed instructions, see [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md)
