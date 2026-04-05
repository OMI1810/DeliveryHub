-- Drop unique constraint on deliveryman_id if it exists
-- This constraint was preventing couriers from having multiple orders
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_indexes
        WHERE tablename = 'orders'
        AND indexname LIKE '%deliveryman%'
        AND indexdef LIKE '%UNIQUE%'
    ) THEN
        -- Try to drop common constraint names
        DROP INDEX IF EXISTS "orders_deliveryman_id_key";
        DROP INDEX IF EXISTS "orders.deliveryman_id_unique";
    END IF;
END $$;

-- Drop partial unique index that limited couriers to one active order
-- This was preventing couriers from handling multiple deliveries
DROP INDEX IF EXISTS "orders_one_active_per_courier_idx";
