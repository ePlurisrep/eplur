-- Add CODE_ARTIFACT enum value and create code_artifacts table
-- Safe append to enum (Postgres allows adding values at the end)
ALTER TYPE "NodeType" ADD VALUE 'CODE_ARTIFACT';

CREATE TABLE IF NOT EXISTS "code_artifacts" (
  entity_id TEXT PRIMARY KEY REFERENCES "Node"(id) ON DELETE CASCADE,
  ecosystem TEXT NOT NULL,
  artifact_type TEXT NOT NULL,
  homepage TEXT,
  repo_url TEXT,
  license TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);
