-- Update existing food orders to link with bookings based on room number and date
-- This is for orders created before bookingId was added

-- Update food order #7 to link with booking #29 (Room 101)
UPDATE food_orders fo
JOIN bookings b ON b.room_id = (
    SELECT r.id FROM rooms r WHERE r.room_number = fo.room_number LIMIT 1
)
SET fo.booking_id = b.id
WHERE fo.id = 7 
  AND fo.room_number = '101'
  AND b.id = 29;

-- Optional: Update all food orders without booking_id if they match an active booking
-- Uncomment if needed
/*
UPDATE food_orders fo
JOIN bookings b ON b.room_id = (
    SELECT r.id FROM rooms r WHERE r.room_number = fo.room_number LIMIT 1
)
AND DATE(fo.order_time) BETWEEN b.check_in_date AND b.check_out_date
AND b.status IN ('CONFIRMED', 'CHECKED_IN')
SET fo.booking_id = b.id
WHERE fo.booking_id IS NULL 
  AND fo.room_number IS NOT NULL;
*/
