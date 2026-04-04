-- DropIndex
DROP INDEX "organizations_owner_id_key";

-- CreateIndex
CREATE INDEX "organizations_owner_id_idx" ON "organizations"("owner_id");
