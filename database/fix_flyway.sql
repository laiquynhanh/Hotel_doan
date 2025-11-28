-- Fix Flyway migration failed
-- Run this in MySQL/XAMPP phpMyAdmin

-- Delete failed migration records
DELETE FROM flyway_schema_history WHERE version = '10' AND success = 0;
DELETE FROM flyway_schema_history WHERE version = '11' AND success = 0;

-- Check remaining migrations
SELECT * FROM flyway_schema_history ORDER BY installed_rank;
