/*
  Warnings:

  - You are about to drop the column `user_id` on the `addresses` table. All the data in the column will be lost.
  - You are about to drop the column `cordinatX` on the `restaurants` table. All the data in the column will be lost.
  - You are about to drop the column `cordinatY` on the `restaurants` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "addresses" DROP CONSTRAINT "addresses_user_id_fkey";

-- DropIndex
DROP INDEX "organizations_owner_id_key";

-- AlterTable
ALTER TABLE "addresses" DROP COLUMN "user_id",
ADD COLUMN     "comment" TEXT,
ADD COLUMN     "doorphone" TEXT,
ADD COLUMN     "entrance" INTEGER,
ADD COLUMN     "flat" TEXT,
ADD COLUMN     "floor" TEXT;

-- AlterTable
ALTER TABLE "restaurants" DROP COLUMN "cordinatX",
DROP COLUMN "cordinatY";

-- CreateTable
CREATE TABLE "address_user" (
    "user_id" TEXT NOT NULL,
    "address_id" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "address_restaurant" (
    "restataunt_id" TEXT NOT NULL,
    "address_id" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "address_user_user_id_address_id_key" ON "address_user"("user_id", "address_id");

-- CreateIndex
CREATE UNIQUE INDEX "address_restaurant_restataunt_id_key" ON "address_restaurant"("restataunt_id");

-- CreateIndex
CREATE UNIQUE INDEX "address_restaurant_address_id_key" ON "address_restaurant"("address_id");

-- CreateIndex
CREATE UNIQUE INDEX "address_restaurant_restataunt_id_address_id_key" ON "address_restaurant"("restataunt_id", "address_id");

-- CreateIndex
CREATE INDEX "organizations_owner_id_idx" ON "organizations"("owner_id");

-- AddForeignKey
ALTER TABLE "address_user" ADD CONSTRAINT "address_user_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id_user") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "address_user" ADD CONSTRAINT "address_user_address_id_fkey" FOREIGN KEY ("address_id") REFERENCES "addresses"("id_address") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "address_restaurant" ADD CONSTRAINT "address_restaurant_restataunt_id_fkey" FOREIGN KEY ("restataunt_id") REFERENCES "restaurants"("id_restaurant") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "address_restaurant" ADD CONSTRAINT "address_restaurant_address_id_fkey" FOREIGN KEY ("address_id") REFERENCES "addresses"("id_address") ON DELETE CASCADE ON UPDATE CASCADE;
