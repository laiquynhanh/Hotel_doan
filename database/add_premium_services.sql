-- Add premium services columns to bookings table
ALTER TABLE bookings 
ADD COLUMN airport_pickup BOOLEAN DEFAULT FALSE,
ADD COLUMN spa_service BOOLEAN DEFAULT FALSE,
ADD COLUMN laundry_service BOOLEAN DEFAULT FALSE,
ADD COLUMN tour_guide BOOLEAN DEFAULT FALSE;

-- Update existing bookings to have false values
UPDATE bookings 
SET airport_pickup = FALSE, 
    spa_service = FALSE, 
    laundry_service = FALSE, 
    tour_guide = FALSE
WHERE airport_pickup IS NULL;
