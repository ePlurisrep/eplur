# API Token Testing Guide

This document provides step-by-step instructions for testing the API token functionality.

## Prerequisites

Before testing, ensure:

1. Database is set up (PostgreSQL via Supabase)
2. Environment variables are configured (`.env.local`)
3. Database migrations have been run: `npx prisma migrate dev`
4. Development server is running: `npm run dev`

## Testing Steps

### 1. Database Migration

First, apply the API token migration:

```bash
# Run Prisma migrations
npx prisma migrate dev

# Verify the ApiToken table was created
npx prisma studio
# Check for "ApiToken" table in the Prisma Studio interface
```

### 2. Access Token Management UI

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Sign in to the application (using Supabase magic link)

3. Navigate to the settings page:
   ```
   http://localhost:3000/settings
   ```

4. You should see the "API Access Tokens" interface

### 3. Create a Token

1. In the settings page, enter a token name (e.g., "Test Token")
2. Click "Create Token"
3. You should see:
   - A success message
   - The new token displayed in a blue box
   - A "Copy" button to copy the token
4. **Important**: Copy the token now - it won't be shown again
5. The token should be a 64-character hexadecimal string

### 4. Verify Token Storage

Check that the token was stored correctly in the database:

```bash
# Open Prisma Studio
npx prisma studio

# Navigate to ApiToken table
# Verify:
# - The token name matches what you entered
# - tokenHash is a 64-character hex string (different from the original token)
# - userId is set
# - createdAt is set
# - revokedAt is null
```

### 5. Test Token Authentication

Using the test script:

```bash
# Set your token as an environment variable
export EPLUR_API_TOKEN="your_token_here"

# Run the test script
node examples/test-api-token.js
```

Expected output:
```
Testing API Token Authentication
================================
API Base: http://localhost:3000
Token: abcdef1234...9876543210

Testing List API Tokens...
  Status: 200 OK
  Response: {"tokens":[{"id":"...","name":"Test Token",...}]}...
  ✓ Success

Testing List Documents...
  Status: 200 OK
  Response: []...
  ✓ Success

Testing Graph API...
  Status: 200 OK
  Response: ...
  ✓ Success

Tests complete!
```

### 6. Test Token with cURL

```bash
# Set token variable
export TOKEN="your_token_here"

# Test listing tokens
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/user/tokens

# Expected: JSON array of your tokens

# Test documents endpoint
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/documents

# Expected: JSON array of documents (may be empty)
```

### 7. Test Token Revocation

1. Go back to http://localhost:3000/settings
2. Find the token you created
3. Click "Revoke" button
4. Confirm the action
5. The token should disappear from the list

Verify in database:
```bash
# Open Prisma Studio
npx prisma studio

# Check the ApiToken table
# The revokedAt field should now have a timestamp
```

Test that the revoked token no longer works:
```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/user/tokens

# Expected: {"error":"Unauthorized"}
```

### 8. Test Invalid Token

```bash
# Try with an invalid token
curl -H "Authorization: Bearer invalid_token_123" \
  http://localhost:3000/api/user/tokens

# Expected: {"error":"Unauthorized"}
```

### 9. Test Without Token

```bash
# Try without Authorization header
curl http://localhost:3000/api/user/tokens

# Expected: {"error":"Unauthorized"}
# (Should fall back to checking for Supabase session, which isn't present)
```

### 10. Test Concurrent Authentication

This tests that both Bearer tokens and Supabase sessions work:

1. Sign in via browser (Supabase session)
2. Navigate to http://localhost:3000/settings
3. Verify you can see the token management interface (session auth works)
4. Open a new terminal and test with Bearer token:
   ```bash
   curl -H "Authorization: Bearer $TOKEN" \
     http://localhost:3000/api/documents
   ```
5. Both should work independently

## Edge Cases to Test

### Token Format Validation

```bash
# Test with wrong format (should fail)
curl -H "Authorization: Bearer too_short" \
  http://localhost:3000/api/user/tokens

# Test with correct length but wrong format
curl -H "Authorization: Bearer 1234567890abcdef1234567890abcdef1234567890abcdef1234567890ZZZZ" \
  http://localhost:3000/api/user/tokens
```

### Multiple Tokens

1. Create multiple tokens with different names
2. Verify all appear in the token list
3. Verify each token works independently
4. Revoke one token
5. Verify others still work

### Token Last Used Timestamp

1. Create a new token
2. Note the "Last used" field (should be empty)
3. Use the token in an API request
4. Refresh the settings page
5. Verify "Last used" is now populated with a recent timestamp

## Troubleshooting

### "Cannot find module '@prisma/client'"

```bash
# Generate Prisma client
npx prisma generate
```

### "P1001: Can't reach database server"

- Check DATABASE_URL in `.env.local`
- Verify database is running
- Test connection: `npx prisma db pull`

### "ApiToken table not found"

```bash
# Run migrations
npx prisma migrate dev

# Or manually apply the SQL from:
# prisma/migrations/0002_add_api_tokens/migration.sql
```

### Token creation fails with "User not found"

- Ensure you're signed in via Supabase
- Check that the User table exists in the database
- The system should auto-create a User record on first token creation

## Success Criteria

The implementation is working correctly if:

- ✅ Tokens can be created via the UI
- ✅ Tokens are stored securely (hashed) in the database
- ✅ Tokens can be used for API authentication (Bearer header)
- ✅ Tokens can be listed via the UI
- ✅ Tokens can be revoked via the UI
- ✅ Revoked tokens no longer work
- ✅ Invalid tokens are rejected
- ✅ Both Bearer tokens and Supabase sessions work
- ✅ Last used timestamp updates when token is used

## Next Steps

After successful testing:

1. Document any issues found
2. Create additional endpoints that support Bearer auth
3. Add rate limiting (optional)
4. Add token scopes/permissions (optional)
5. Deploy to production and test with real data
