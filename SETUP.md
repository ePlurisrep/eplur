# eplur Setup Guide

This guide covers setting up the eplur project for local development and configuring GitHub Actions workflows.

## Prerequisites

- Node.js (v20 or later recommended)
- npm or yarn
- PostgreSQL database (we recommend Supabase)
- GitHub account with repository access

## Local Development Setup

### 1. Clone the Repository

```bash
git clone https://github.com/ePlurisrep/eplur.git
cd eplur
```

### 2. Install Dependencies

```bash
npm install
```

**Note on NVM Issues**: If you encounter an error like:
```
ln: failed to create symbolic link '/usr/local/share/nvm/current/vX.X.X': File exists
```

This is a known issue with NVM in certain development environments (Codespaces, devcontainers). To resolve:

```bash
# Option 1: Remove the existing symlink and reinstall node
rm -f /usr/local/share/nvm/current/*
nvm install 20
nvm use 20

# Option 2: Use the node version that's already installed
nvm use system
# or
nvm use 20
```

The application should work with Node.js v20 or later.

### 3. Set Up Environment Variables

Copy the example environment file:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your configuration:

```env
# API Keys for Government Data Sources
GOVINFO_API=your_govinfo_api_key_here
DATA_GOV_API=your_data_gov_api_key_here

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Database URLs (for Prisma)
DATABASE_URL=postgresql://postgres:your_password@db.your-project.supabase.co:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://postgres:your_password@db.your-project.supabase.co:5432/postgres
```

**Important**: Never commit `.env.local` to version control. It's already in `.gitignore`.

### 4. Database Setup

If using Supabase:

1. Create a Supabase project at https://app.supabase.com
2. Get your database connection strings from Project Settings → Database
3. Get your API keys from Project Settings → API

Run Prisma migrations:

```bash
npx prisma migrate dev
```

### 5. Run the Development Server

```bash
npm run dev
```

The application will be available at http://localhost:3000

## GitHub Actions Setup

### Setting Up Repository Secrets

The `prisma-migrate` workflow requires two secrets to be configured:

- `DATABASE_URL` - PostgreSQL connection string with pgbouncer (port 6543)
- `DIRECT_URL` - Direct PostgreSQL connection string (port 5432)

#### Why `gh secret set` Fails with 403 Error

If you see this error when trying to set secrets via the `gh` CLI:

```
failed to fetch public key: HTTP 403: Resource not accessible by integration
```

This means the GitHub token doesn't have the necessary permissions. This commonly happens when:
- Using a personal access token without `repo` or `secrets` scope
- Using the GITHUB_TOKEN in Actions which has limited permissions
- Not having admin access to the repository

#### How to Set Secrets via GitHub Web UI (Recommended)

1. Go to your repository on GitHub
2. Click on **Settings** tab
3. In the left sidebar, expand **Secrets and variables** → **Actions**
4. Click **New repository secret**
5. Add each secret:
   - **Name**: `DATABASE_URL`
   - **Value**: `postgresql://postgres:YOUR_PASSWORD@db.your-project.supabase.co:6543/postgres?pgbouncer=true`
   
   Click **Add secret**

6. Repeat for `DIRECT_URL`:
   - **Name**: `DIRECT_URL`
   - **Value**: `postgresql://postgres:YOUR_PASSWORD@db.your-project.supabase.co:5432/postgres`

**Security Note**: Make sure to URL-encode your password if it contains special characters:

```bash
# Use Python to URL-encode your password
python -c "import urllib.parse,sys; print(urllib.parse.quote(sys.argv[1]))" "your_password_here"
```

Then use the encoded password in your connection strings.

#### Alternative: Using gh CLI with Proper Permissions

If you prefer using the CLI, ensure you have a personal access token with the correct scopes:

1. Go to GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Generate a new token with these scopes:
   - `repo` (Full control of private repositories)
   - `workflow` (Update GitHub Action workflows)
3. Authenticate gh CLI with your token:
   ```bash
   gh auth login
   ```
4. Set the secrets:
   ```bash
   gh secret set DATABASE_URL --body "postgresql://postgres:URL_ENCODED_PASS@db.project.supabase.co:6543/postgres?pgbouncer=true"
   gh secret set DIRECT_URL --body "postgresql://postgres:URL_ENCODED_PASS@db.project.supabase.co:5432/postgres"
   ```

### Running the Migration Workflow

Once secrets are configured, you can manually trigger the Prisma migration workflow:

1. Go to the **Actions** tab in your repository
2. Select **prisma:migrate** workflow
3. Click **Run workflow**
4. Select the branch and click **Run workflow**

This will deploy pending Prisma migrations to your production database.

## Troubleshooting

### NVM Symbolic Link Issues

If you continue to have NVM issues in Codespaces or devcontainers:

1. Check which Node version is active:
   ```bash
   node --version
   nvm current
   ```

2. If needed, reinstall the Node version:
   ```bash
   nvm deactivate
   nvm uninstall 20
   nvm install 20
   nvm use 20
   ```

3. Make it the default:
   ```bash
   nvm alias default 20
   ```

### Database Connection Issues

If Prisma can't connect to the database:

1. Verify your connection strings are correct
2. Ensure your database is accessible (check firewall rules)
3. Test the connection:
   ```bash
   npx prisma db pull
   ```

### GitHub Secrets Not Working

If the workflow runs but can't access secrets:

1. Verify secrets are set in the correct repository (not your fork)
2. Check the secret names match exactly (case-sensitive)
3. Re-save the secrets to ensure they're properly encrypted

## Additional Resources

- [README_SUPABASE.md](./README_SUPABASE.md) - Detailed Supabase setup
- [Prisma Documentation](https://www.prisma.io/docs/)
- [Supabase Documentation](https://supabase.com/docs)
- [GitHub Actions Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
