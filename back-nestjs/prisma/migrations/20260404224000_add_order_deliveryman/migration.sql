ALTER TABLE "orders"
ADD COLUMN "deliveryman_id" TEXT;

ALTER TABLE "orders"
ADD CONSTRAINT "orders_deliveryman_id_fkey"
FOREIGN KEY ("deliveryman_id")
REFERENCES "users"("id_user")
ON DELETE SET NULL
ON UPDATE CASCADE;

CREATE UNIQUE INDEX "orders_one_active_per_courier_idx"
ON "orders" ("deliveryman_id")
WHERE "deliveryman_id" IS NOT NULL AND "status" = 'FROM_DELIVERYMAN';
