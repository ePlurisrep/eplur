Supabase setup (CLI)

1. Install Supabase CLI

```bash
npm install -g supabase
# or
# brew install supabase/tap/supabase
```

2. Create or use an existing project in the Supabase dashboard: https://app.supabase.com

3. Obtain your DB connection string and service role key from the project settings (Database / Connection string and API / Service key).

4. Locally, set env vars (example `.env.local` for Next.js):

```
NEXT_PUBLIC_SUPABASE_URL=https://xyzcompany.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=anon_key_here
SUPABASE_URL=https://xyzcompany.supabase.co
SUPABASE_SERVICE_ROLE_KEY=service_role_key_here
DATABASE_URL=postgresql://user:password@db.host:5432/postgres
```

5. Apply the SQL schema (uses `psql`):

```bash
# ensure psql is installed
./scripts/apply_schema.sh
```

Notes:
- Do NOT commit `.env.local` with secrets.
- Use the service role key only on the server (e.g., in API routes or server-side scripts).
- RLS is enabled in `database/schema.sql` and restricts access to `auth.uid() = user_id`.
 
Storage and Auth setup
----------------------

1. Enable Storage in the Supabase dashboard

- Go to the project → Storage → Create a new bucket (e.g., `uploads`).
- Set public/private rules as needed (private for user uploads).

2. Configure Auth for email magic link

- In the Supabase dashboard: Authentication → Settings → Sign-in methods.
- Enable "Email" sign-in, and choose the "Magic Link" / "Passwordless" option.
- (Optional) Disable password sign-ups if you want to force passwordless flows.

3. Test magic-link sign-in locally

- Use the `components/Auth.tsx` React component (added to this repo) to send magic links.
- Example usage: import the component and render it on a page to let users request a link.

Verify RLS (Row Level Security)
------------------------------

1. Create a test user using the Auth UI or the dashboard.
2. From the browser client, after signing in, call the REST API or use the Supabase client to insert and read documents. RLS will limit access to only that user's documents.

Example: Insert a document as the signed-in user (client-side JS):

```js
// client-side example (user must be signed in)
import { supabase } from './lib/supabase'

async function addDocument(metadata) {
	const user = supabase.auth.getUser() // or use onAuthStateChange
	const { data, error } = await supabase.from('documents').insert([{ user_id: user?.id, source: 'upload', metadata }])
	return { data, error }
}
```

Server-side insert using the service role (only use on server):

```js
// server-side example using supabaseAdmin (service role)
import { supabaseAdmin } from './lib/supabase'

// only call this on trusted servers
await supabaseAdmin.from('documents').insert([{ user_id: 'USER_UUID', source: 'gov', metadata: { title: 'Example' } }])
```

Testing RLS via curl (example)

1. Get the user's access token from the client (after sign-in).
2. Call the PostgREST endpoint with Authorization header:

```bash
curl -H "Authorization: Bearer <USER_ACCESS_TOKEN>" \
	"https://<project>.supabase.co/rest/v1/documents?select=*"
```

This will return only documents belonging to the authenticated user (per the RLS policy in `database/schema.sql`).

If you want, I can add a small server-side example showing how to insert a document using `supabaseAdmin`.
