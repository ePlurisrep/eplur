# eplur
Unified US Gov Data Search

<!-- PHASE 1 IS FEATURE-FROZEN. DO NOT ADD. -->

## Quick Start

For detailed setup instructions, including GitHub Actions configuration and troubleshooting, see [SETUP.md](./SETUP.md).

### Installation

```bash
# Install dependencies
npm install

# Copy environment template
cp .env.local.example .env.local

# Edit .env.local with your API keys and database URLs

# Run database migrations (if using Prisma)
npx prisma migrate dev

# Start development server
npm run dev
```

### Required API Keys

Get API keys from:

- **GovInfo API**: Register at https://www.govinfo.gov/developers
- **Data.gov API**: Get from https://api.data.gov/signup/
- **Census API**: No API key required - uses public dataset catalog

### Database Setup

This project uses Prisma with PostgreSQL (recommended: Supabase). See [SETUP.md](./SETUP.md) for detailed database configuration.

## Development

Run development server:

```bash
npm run dev
```

The application will be available at http://localhost:3000

## Additional Documentation

- [SETUP.md](./SETUP.md) - Comprehensive setup guide with troubleshooting
- [README_SUPABASE.md](./README_SUPABASE.md) - Supabase-specific setup
- [DATA_MODEL.md](./DATA_MODEL.md) - Data model documentation
- [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) - Design system guidelines
