# API Access Tokens

This document describes how to create and use API access tokens for programmatic access to the eplur API.

## Overview

API access tokens allow you to authenticate API requests without using your Supabase session. This is useful for:

- Building CLI tools or scripts
- Integrating with third-party applications
- Automating workflows
- Server-to-server communication

## Creating an API Token

### Via Web UI

1. Sign in to your account at https://your-domain.com
2. Navigate to **Settings** at https://your-domain.com/settings
3. In the "API Access Tokens" section, enter a name for your token (e.g., "My Script", "Production Server")
4. Click **Create Token**
5. **Important**: Copy the token immediately - it will only be shown once!

### Security Best Practices

- Store tokens securely (use environment variables, not hardcoded in source code)
- Create separate tokens for different applications
- Revoke tokens that are no longer needed
- Never commit tokens to version control

## Using API Tokens

### Authentication

Include your token in the `Authorization` header of your API requests:

```bash
Authorization: Bearer YOUR_TOKEN_HERE
```

### Example Requests

#### Using cURL

```bash
# Example: Fetch user's documents
curl -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  https://your-domain.com/api/documents
```

#### Using JavaScript/Node.js

```javascript
const token = process.env.API_TOKEN;

const response = await fetch('https://your-domain.com/api/documents', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});

const data = await response.json();
console.log(data);
```

#### Using Python

```python
import os
import requests

token = os.environ['API_TOKEN']

response = requests.get(
    'https://your-domain.com/api/documents',
    headers={
        'Authorization': f'Bearer {token}',
        'Content-Type': 'application/json'
    }
)

data = response.json()
print(data)
```

## Managing Tokens

### List Your Tokens

```bash
GET /api/user/tokens
```

Returns a list of all active tokens for your account, including:
- Token ID
- Token name
- Creation date
- Last used date

### Revoke a Token

To revoke a token (e.g., if it's compromised or no longer needed):

```bash
DELETE /api/user/tokens/{token_id}
```

Or use the web UI at https://your-domain.com/settings and click **Revoke** next to the token.

## API Endpoints That Support Token Authentication

The following endpoints support Bearer token authentication:

- `/api/documents` - Document management
- `/api/graph` - Graph operations
- `/api/graph/saved` - Saved graphs
- `/api/user-nodes` - User node management
- And more...

## Token Format

- Tokens are 64-character hexadecimal strings
- Tokens are hashed using SHA-256 before storage
- Only the hash is stored in the database for security

## Troubleshooting

### "Unauthorized" Error

If you receive a 401 Unauthorized error:

1. Verify your token is correct (copy/paste carefully)
2. Check that the token hasn't been revoked
3. Ensure the `Authorization` header is properly formatted: `Bearer YOUR_TOKEN`

### Token Not Working

- Tokens are only shown once during creation
- If you lost your token, create a new one and revoke the old one
- Check that you're using the correct environment/domain

## Security Notes

- **Never share your tokens** - they provide full access to your account
- **Rotate tokens regularly** - create new tokens and revoke old ones periodically
- **Use HTTPS only** - never send tokens over unencrypted connections
- **Monitor token usage** - check the "Last Used" date in your settings
- **Revoke compromised tokens immediately** - if a token is exposed, revoke it right away

## Rate Limiting

API tokens are subject to the same rate limits as regular authenticated requests. If you need higher rate limits, please contact support.

## Support

For questions or issues with API tokens, please:

1. Check the documentation above
2. Review the [API documentation](./API.md) (if available)
3. Open an issue on GitHub
4. Contact support

## Example: Complete Script

Here's a complete example of using an API token in a Node.js script:

```javascript
#!/usr/bin/env node

const API_TOKEN = process.env.EPLUR_API_TOKEN;
const API_BASE = process.env.EPLUR_API_BASE || 'https://your-domain.com';

if (!API_TOKEN) {
  console.error('Error: EPLUR_API_TOKEN environment variable not set');
  process.exit(1);
}

async function fetchDocuments() {
  try {
    const response = await fetch(`${API_BASE}/api/documents`, {
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Documents:', data);
  } catch (error) {
    console.error('Error fetching documents:', error.message);
    process.exit(1);
  }
}

fetchDocuments();
```

Save this as `fetch-documents.js` and run:

```bash
export EPLUR_API_TOKEN="your_token_here"
node fetch-documents.js
```
