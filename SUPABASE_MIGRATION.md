# Running Prisma Migration with Supabase

This guide provides step-by-step instructions for running the API token migration (`0002_add_api_tokens`) with a Supabase database.

## Prerequisites

1. **Supabase Project**: You need an active Supabase project
2. **Database Access**: Your Supabase database connection strings
3. **Prisma CLI**: Installed via npm (version 4.15.0)

## Step 1: Get Your Supabase Connection Strings

### From Supabase Dashboard

1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Select your project
3. Navigate to **Project Settings** → **Database**
4. Find the "Connection string" section

### Two Connection Strings Needed

Supabase requires TWO different connection strings for Prisma:

#### 1. DATABASE_URL (Connection Pooler - Port 6543)
Used for application queries. Uses connection pooling.

```
postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

#### 2. DIRECT_URL (Direct Connection - Port 5432)
Used for migrations and schema changes. Direct connection without pooling.

```
postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:5432/postgres
```

**Important Notes:**
- Replace `[PROJECT-REF]` with your actual project reference
- Replace `[PASSWORD]` with your database password
- The region (`aws-0-us-east-1`) may differ based on your project location
- **URL-encode your password** if it contains special characters

### URL-Encoding Your Password

If your password contains special characters, encode it:

```bash
# Using Python
python -c "import urllib.parse,sys; print(urllib.parse.quote(sys.argv[1]))" "your_password"

# Using Node.js
node -e "console.log(encodeURIComponent(process.argv[1]))" "your_password"
```

## Step 2: Configure .env.local

Create or update `.env.local` in the project root:

```env
# Supabase API Keys
NEXT_PUBLIC_SUPABASE_URL=https://[PROJECT-REF].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Prisma Database URLs
DATABASE_URL=postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:5432/postgres
```

**Security Note:** Never commit `.env.local` to version control. It's already in `.gitignore`.

## Step 3: Run the Migration

### Option 1: Automated Script (Recommended)

```bash
./scripts/run-supabase-migration.sh
```

This script will:
- ✅ Verify your configuration
- ✅ Test Supabase connection
- ✅ Check current migration status
- ✅ Apply the migration using DIRECT_URL
- ✅ Generate Prisma Client
- ✅ Verify success

### Option 2: Manual Migration

```bash
# Check status
npx prisma@4.15.0 migrate status

# Run migration
npx prisma@4.15.0 migrate deploy

# Generate Prisma Client
npx prisma@4.15.0 generate
```

### Option 3: Using NPM Scripts

```bash
npm run migrate
```

## Step 4: Verify Migration Success

### Check in Supabase Dashboard

1. Go to your Supabase project
2. Navigate to **Table Editor**
3. Look for the `ApiToken` table
4. Verify it has these columns:
   - `id` (text)
   - `userId` (text)
   - `name` (text)
   - `tokenHash` (text)
   - `lastUsedAt` (timestamp)
   - `createdAt` (timestamp)
   - `revokedAt` (timestamp)

### Using Prisma Studio

```bash
npm run db:studio
```

This opens a web interface where you can view all tables, including the new `ApiToken` table.

### Using SQL Editor in Supabase

Go to **SQL Editor** in Supabase Dashboard and run:

```sql
SELECT * FROM information_schema.tables 
WHERE table_name = 'ApiToken';
```

## Troubleshooting

### Error: "Can't reach database server"

**Cause:** Database URL is incorrect or database is not accessible.

**Solutions:**
1. Verify your DATABASE_URL and DIRECT_URL in `.env.local`
2. Check that your IP is not blocked by Supabase
3. Ensure your Supabase project is active (not paused)
4. Try pinging the database host

### Error: "Invalid connection string"

**Cause:** Password contains special characters that need URL encoding.

**Solution:** URL-encode your password (see Step 1 above)

### Error: "Migration failed: User table does not exist"

**Cause:** The previous migration (0001_add_graph_and_overlays) hasn't been run.

**Solution:**
```bash
# Run all pending migrations
npx prisma@4.15.0 migrate deploy
```

### Error: "Cannot find module 'prisma/config'"

**Cause:** Wrong Prisma version being used.

**Solution:** Always specify version 4.15.0:
```bash
npx prisma@4.15.0 migrate deploy
```

### Error: "Connection pooler not supported for migrations"

**Cause:** Using DATABASE_URL (port 6543) instead of DIRECT_URL.

**Solution:** Ensure DIRECT_URL is set in `.env.local` pointing to port 5432.

### Supabase Connection Timeout

**Cause:** Supabase project may be paused or network issues.

**Solutions:**
1. Check project status in Supabase dashboard
2. Restart the project if paused
3. Check your network connection
4. Try again in a few minutes

## Supabase-Specific Considerations

### Connection Pooling

Supabase uses PgBouncer for connection pooling:
- **Port 6543**: Connection pooler (for app queries)
- **Port 5432**: Direct connection (for migrations)

Prisma migrations require the direct connection (port 5432).

### Session Mode vs Transaction Mode

When using connection pooling:
- Use `?pgbouncer=true` in DATABASE_URL
- This enables Session Mode
- Migrations automatically use DIRECT_URL (no pooling)

### Row Level Security (RLS)

The ApiToken table inherits standard PostgreSQL permissions. RLS policies are not needed since:
- Access is controlled at the application level
- Only server-side code can query ApiToken table
- Users interact via API endpoints that enforce ownership

### Supabase Auth Integration

The migration creates a foreign key from `ApiToken.userId` to `User.id`. This allows:
- Automatic cleanup when users are deleted (CASCADE)
- Referential integrity between tokens and users
- Integration with Supabase Auth via the User table

## Production Deployment

### Environment Variables

Set these in your production environment:

```env
DATABASE_URL=postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:5432/postgres
```

### Running Migration in Production

**Option 1: GitHub Actions**

The repository includes a workflow for running migrations. Set up repository secrets:
- `DATABASE_URL`
- `DIRECT_URL`

**Option 2: Manual Deployment**

```bash
# Set environment variables
export DATABASE_URL="your_production_url"
export DIRECT_URL="your_production_direct_url"

# Run migration
npx prisma@4.15.0 migrate deploy
```

**Option 3: Supabase CLI**

```bash
# Link to your project
supabase link --project-ref [PROJECT-REF]

# Push migrations
supabase db push
```

## Next Steps

After successful migration:

1. **Restart Development Server**
   ```bash
   npm run dev
   ```

2. **Test Token Management UI**
   - Navigate to: `http://localhost:3000/settings`
   - Create a test token
   - Verify it appears in the list

3. **Test API Authentication**
   ```bash
   # Export token
   export EPLUR_API_TOKEN="your_token_here"
   
   # Run test script
   node examples/test-api-token.js
   ```

4. **Review Documentation**
   - `API_TOKENS.md` - Usage guide
   - `TESTING_API_TOKENS.md` - Testing procedures

## Additional Resources

- [Supabase Database Docs](https://supabase.com/docs/guides/database)
- [Prisma with Supabase](https://www.prisma.io/docs/guides/database/supabase)
- [Connection Pooling](https://supabase.com/docs/guides/database/connecting-to-postgres#connection-pooler)

## Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review Supabase project logs
3. Check Prisma migration logs
4. Refer to `MIGRATION_GUIDE.md` for general migration help
