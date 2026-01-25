-- Migration: add_code_artifacts_foundation
-- Adds CODE_ARTIFACT enum value and foundation tables for code artifacts, capabilities, and dependencies

-- Add enum value (safe append)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid WHERE t.typname = 'nodetype' AND e.enumlabel = 'CODE_ARTIFACT') THEN
    ALTER TYPE "NodeType" ADD VALUE 'CODE_ARTIFACT';
  END IF;
END$$;

-- Create code_artifacts table (entity overlay)
CREATE TABLE IF NOT EXISTS "code_artifacts" (
  "entity_id" TEXT PRIMARY KEY REFERENCES "Node"(id) ON DELETE CASCADE,
  "ecosystem" TEXT NOT NULL,
  "artifact_type" TEXT NOT NULL,
  "homepage" TEXT,
  "repo_url" TEXT,
  "license" TEXT,
  "created_at" TIMESTAMP DEFAULT now(),
  "updated_at" TIMESTAMP DEFAULT now()
);

-- Create code_capabilities table
CREATE TABLE IF NOT EXISTS "code_capabilities" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "entity_id" TEXT REFERENCES "Node"(id) ON DELETE CASCADE,
  "capability" TEXT NOT NULL,
  "confidence" DOUBLE PRECISION DEFAULT 1.0,
  "source" TEXT DEFAULT 'manual',
  "created_at" TIMESTAMP DEFAULT now(),
  CONSTRAINT "code_capabilities_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "code_capabilities_capability_idx" ON "code_capabilities"("capability");
CREATE INDEX IF NOT EXISTS "code_capabilities_entity_idx" ON "code_capabilities"("entity_id");

-- Create code_dependencies table
CREATE TABLE IF NOT EXISTS "code_dependencies" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "entity_id" TEXT REFERENCES "Node"(id) ON DELETE CASCADE,
  "depends_on_entity_id" TEXT REFERENCES "Node"(id) ON DELETE CASCADE,
  "dependency_type" TEXT DEFAULT 'runtime',
  "created_at" TIMESTAMP DEFAULT now(),
  CONSTRAINT "code_dependencies_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "code_dependencies_unique" UNIQUE ("entity_id", "depends_on_entity_id")
);
CREATE INDEX IF NOT EXISTS "code_dependencies_entity_idx" ON "code_dependencies"("entity_id");
CREATE INDEX IF NOT EXISTS "code_dependencies_depends_on_idx" ON "code_dependencies"("depends_on_entity_id");
