-- Add code_capabilities and code_dependencies tables

CREATE TABLE IF NOT EXISTS "code_capabilities" (
  "id" TEXT NOT NULL,
  "entity_id" TEXT REFERENCES "Node"(id) ON DELETE CASCADE,
  "capability" TEXT NOT NULL,
  "confidence" DOUBLE PRECISION DEFAULT 1.0,
  "source" TEXT DEFAULT 'manual',
  "created_at" TIMESTAMP DEFAULT now(),
  CONSTRAINT "code_capabilities_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "code_dependencies" (
  "id" TEXT NOT NULL,
  "entity_id" TEXT REFERENCES "Node"(id) ON DELETE CASCADE,
  "depends_on_entity_id" TEXT REFERENCES "Node"(id) ON DELETE CASCADE,
  "dependency_type" TEXT DEFAULT 'runtime',
  "created_at" TIMESTAMP DEFAULT now(),
  CONSTRAINT "code_dependencies_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "code_dependencies_unique" UNIQUE ("entity_id", "depends_on_entity_id")
);

CREATE INDEX IF NOT EXISTS "code_capabilities_entity_idx" ON "code_capabilities"("entity_id");
CREATE INDEX IF NOT EXISTS "code_dependencies_entity_idx" ON "code_dependencies"("entity_id");
CREATE INDEX IF NOT EXISTS "code_dependencies_depends_on_idx" ON "code_dependencies"("depends_on_entity_id");
