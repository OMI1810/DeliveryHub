-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'CASHIER';

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "cashier_restaurant_id" TEXT;

-- CreateIndex
CREATE INDEX "users_cashier_restaurant_id_idx" ON "users"("cashier_restaurant_id");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_cashier_restaurant_id_fkey" FOREIGN KEY ("cashier_restaurant_id") REFERENCES "restaurants"("id_restaurant") ON DELETE SET NULL ON UPDATE CASCADE;
