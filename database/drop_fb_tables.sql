-- Drop Food & Beverage tables if they exist
-- Run this in phpMyAdmin before starting backend

DROP TABLE IF EXISTS food_order_items;
DROP TABLE IF EXISTS food_orders;
DROP TABLE IF EXISTS food_items;
DROP TABLE IF EXISTS table_reservations;
DROP TABLE IF EXISTS restaurant_tables;

-- Now delete the migration records
DELETE FROM flyway_schema_history WHERE version IN ('10', '11');

-- Check what's left
SELECT * FROM flyway_schema_history ORDER BY installed_rank;
