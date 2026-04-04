-- DropIndex (may already be removed by another migration)
DROP INDEX IF EXISTS "organizations_owner_id_key";

-- CreateIndex
CREATE INDEX IF NOT EXISTS "organizations_owner_id_idx" ON "organizations"("owner_id");
