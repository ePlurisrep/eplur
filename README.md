# eplur
Unified US Gov Data Search

<!-- PHASE 1 IS FEATURE-FROZEN. DO NOT ADD. -->

## Setup

### API Keys

This application requires API keys for government data sources. Create a `.env.local` file in the root directory:

```bash
# Copy the template
cp .env.local.example .env.local
```

Get API keys from:

- **GovInfo API**: Register at https://www.govinfo.gov/developers to get an API key
- **Data.gov API**: Get from https://api.data.gov/signup/
- **Census API**: No API key required - uses public dataset catalog

### Environment Variables

```env
DATA_GOV_API=your_data_gov_api_key
GOVINFO_API=your_govinfo_api_key
CENSUS_API=your_census_api_key
```

## Next.js Development

This repository now contains a minimal Next.js app scaffold.

Install dependencies:

```bash
npm install
```

Run development server:

```bash
npm run dev
```

The app's entry is in `pages/index.js` and global styles in `styles/globals.css`.
