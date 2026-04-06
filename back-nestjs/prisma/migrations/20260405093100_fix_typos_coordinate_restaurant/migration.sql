-- Rename column restataunt_id to restaurant_id in address_restaurant
ALTER TABLE "address_restaurant" RENAME COLUMN "restataunt_id" TO "restaurant_id";

-- Rename columns cordinatX/cordinatY to coordinate_x/coordinate_y in addresses
ALTER TABLE "addresses" RENAME COLUMN "cordinatX" TO "coordinate_x";
ALTER TABLE "addresses" RENAME COLUMN "cordinatY" TO "coordinate_y";

-- Rename column restaraunt_id to restaurant_id in orders
ALTER TABLE "orders" RENAME COLUMN "restaraunt_id" TO "restaurant_id";
