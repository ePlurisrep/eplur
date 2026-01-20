# ePluris — Data Model (first pass)

Design principles
- Keep records deduplicated and canonical.
- Snapshot immutable captures of a record over time.
- Record events capture detected changes (diffs, removals, moves).
- Vault items are per-user saved pointers to records/snapshots (no public sharing by default).

Tables (first pass)

1) records
- `id` UUID (primary) — canonical id for the record
- `source` TEXT — e.g. "Agency site", adapter name
- `source_url` TEXT — the page/source that was used to discover the record
- `external_id` TEXT — original id from the source when available
- `canonical_title` TEXT
- `record_kind` TEXT — enum: Document, Dataset, Page, etc.
- `jurisdiction` TEXT
- `agency` TEXT
- `date_start` DATE
- `date_end` DATE
- `created_at` TIMESTAMP

2) record_snapshots
- `id` UUID (primary)
- `record_id` UUID (fk -> records.id)
- `title` TEXT
- `summary` TEXT
- `metadata_json` JSONB — full parsed metadata captured
- `captured_at` TIMESTAMP

3) record_events
- `id` UUID (primary)
- `record_id` UUID (fk -> records.id)
- `event_type` TEXT — enum: updated, removed, moved
- `diff_json` JSONB — structured delta between snapshots
- `detected_at` TIMESTAMP

4) vault_items
- `id` UUID (primary)
- `user_id` UUID (future auth user)
- `record_id` UUID (fk -> records.id)
- `snapshot_id` UUID (nullable; fk -> record_snapshots.id)
- `saved_at` TIMESTAMP

Notes / decisions
- `records` is canonical and deduplicated using `external_id` + `source` or URL fingerprinting.
- `record_snapshots` store captured metadata and content pointers (not necessarily full content — may reference extracted text elsewhere).
- `record_events` are append-only audit events describing changes detected between snapshots; diffs stored as JSON.
- `vault_items` are personal and private; initial implementation can be client-side/localStorage (current concept) and later migrated to Supabase.
- Do not proxy original sources invisibly; always store `source_url` and prefer direct links when viewing records.

Migration / implementation notes
- Use UUIDs for stable identifiers across systems.
- Use JSONB for flexible metadata and diffs.
- Index `records(source, external_id)`, `records(source_url)`, and `vault_items(user_id)`.
- Plan a background job to capture snapshots and generate events/diffs.

This document is a first pass — we can iterate fields, types, and constraints when wiring Supabase/DB.
