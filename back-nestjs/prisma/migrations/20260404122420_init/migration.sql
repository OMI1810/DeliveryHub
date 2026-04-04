-- CreateEnum
CREATE TYPE "Role" AS ENUM ('GOD', 'MODERATOR', 'CLIENT', 'OWNER', 'DELIVERYMAN');

-- CreateEnum
CREATE TYPE "Status" AS ENUM ('CREATED', 'COOKING', 'FROM_DELIVERYMAN', 'DELIVERED');

-- CreateTable
CREATE TABLE "users" (
    "id_user" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "password" TEXT NOT NULL,
    "surname" TEXT,
    "name" TEXT,
    "patronymic" TEXT,
    "verification_token" TEXT,
    "otp_code" TEXT,
    "otp_expires_at" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id_user")
);

-- CreateTable
CREATE TABLE "user_roles" (
    "id_user_role" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "user_roles_pkey" PRIMARY KEY ("id_user_role")
);

-- CreateTable
CREATE TABLE "shifts" (
    "id_shift" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "stop_at" TIMESTAMP(3),

    CONSTRAINT "shifts_pkey" PRIMARY KEY ("id_shift")
);

-- CreateTable
CREATE TABLE "addresses" (
    "id_address" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "entrance" INTEGER,
    "doorphone" TEXT,
    "flat" TEXT,
    "floor" TEXT,
    "comment" TEXT,
    "cordinatY" DOUBLE PRECISION NOT NULL,
    "cordinatX" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "addresses_pkey" PRIMARY KEY ("id_address")
);

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

-- CreateTable
CREATE TABLE "orders" (
    "id_order" TEXT NOT NULL,
    "pay_status" BOOLEAN NOT NULL DEFAULT false,
    "status" "Status" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "client_id" TEXT NOT NULL,
    "restaraunt_id" TEXT NOT NULL,
    "address_id" TEXT NOT NULL,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id_order")
);

-- CreateTable
CREATE TABLE "products" (
    "id_product" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "time_cooking" INTEGER,
    "calories" DOUBLE PRECISION,
    "description" TEXT,
    "restaurant_id" TEXT NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id_product")
);

-- CreateTable
CREATE TABLE "organizations" (
    "id_organization" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "owner_id" TEXT NOT NULL,

    CONSTRAINT "organizations_pkey" PRIMARY KEY ("id_organization")
);

-- CreateTable
CREATE TABLE "restaurants" (
    "id_restaurant" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "cuisine" TEXT,
    "time_opened" TIME(0) NOT NULL,
    "time_closed" TIME(0) NOT NULL,
    "organization_id" TEXT NOT NULL,

    CONSTRAINT "restaurants_pkey" PRIMARY KEY ("id_restaurant")
);

-- CreateTable
CREATE TABLE "_OrderToProduct" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_OrderToProduct_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_key" ON "users"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "user_roles_user_id_role_key" ON "user_roles"("user_id", "role");

-- CreateIndex
CREATE UNIQUE INDEX "address_user_user_id_address_id_key" ON "address_user"("user_id", "address_id");

-- CreateIndex
CREATE UNIQUE INDEX "address_restaurant_restataunt_id_key" ON "address_restaurant"("restataunt_id");

-- CreateIndex
CREATE UNIQUE INDEX "address_restaurant_address_id_key" ON "address_restaurant"("address_id");

-- CreateIndex
CREATE UNIQUE INDEX "address_restaurant_restataunt_id_address_id_key" ON "address_restaurant"("restataunt_id", "address_id");

-- CreateIndex
CREATE UNIQUE INDEX "organizations_name_key" ON "organizations"("name");

-- CreateIndex
CREATE UNIQUE INDEX "organizations_email_key" ON "organizations"("email");

-- CreateIndex
CREATE UNIQUE INDEX "organizations_owner_id_key" ON "organizations"("owner_id");

-- CreateIndex
CREATE INDEX "_OrderToProduct_B_index" ON "_OrderToProduct"("B");

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id_user") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shifts" ADD CONSTRAINT "shifts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id_user") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "address_user" ADD CONSTRAINT "address_user_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id_user") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "address_user" ADD CONSTRAINT "address_user_address_id_fkey" FOREIGN KEY ("address_id") REFERENCES "addresses"("id_address") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "address_restaurant" ADD CONSTRAINT "address_restaurant_restataunt_id_fkey" FOREIGN KEY ("restataunt_id") REFERENCES "restaurants"("id_restaurant") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "address_restaurant" ADD CONSTRAINT "address_restaurant_address_id_fkey" FOREIGN KEY ("address_id") REFERENCES "addresses"("id_address") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_address_id_fkey" FOREIGN KEY ("address_id") REFERENCES "addresses"("id_address") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "users"("id_user") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_restaraunt_id_fkey" FOREIGN KEY ("restaraunt_id") REFERENCES "restaurants"("id_restaurant") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_restaurant_id_fkey" FOREIGN KEY ("restaurant_id") REFERENCES "restaurants"("id_restaurant") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organizations" ADD CONSTRAINT "organizations_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id_user") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "restaurants" ADD CONSTRAINT "restaurants_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id_organization") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_OrderToProduct" ADD CONSTRAINT "_OrderToProduct_A_fkey" FOREIGN KEY ("A") REFERENCES "orders"("id_order") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_OrderToProduct" ADD CONSTRAINT "_OrderToProduct_B_fkey" FOREIGN KEY ("B") REFERENCES "products"("id_product") ON DELETE CASCADE ON UPDATE CASCADE;
