-- AlterEnum
ALTER TYPE "Status" ADD VALUE 'COURIER_ACCEPTED';

-- AlterTable
ALTER TABLE "order_products" ALTER COLUMN "price" SET DEFAULT 0;

-- AlterTable
ALTER TABLE "products" ALTER COLUMN "price" SET DEFAULT 0;
