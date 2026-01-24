# Quick Migration Commands

## Run the Migration

The simplest way to apply the API token migration:

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

## Alternative: Using Script

```bash
./scripts/run-migration.sh
```

## What Gets Created

This migration adds the `ApiToken` table for API access token management.

For detailed instructions, see [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md)
