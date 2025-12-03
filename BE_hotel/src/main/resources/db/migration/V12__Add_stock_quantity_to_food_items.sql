-- Add stock_quantity column to food_items table
ALTER TABLE food_items
ADD COLUMN stock_quantity INT NOT NULL DEFAULT 0;

-- Set default stock quantity for existing items (50 items each)
UPDATE food_items SET stock_quantity = 50;
