-- Add booking_id column to table_reservations
ALTER TABLE table_reservations
ADD COLUMN booking_id BIGINT NULL AFTER user_id,
ADD CONSTRAINT fk_table_reservation_booking 
    FOREIGN KEY (booking_id) 
    REFERENCES bookings(id) 
    ON DELETE SET NULL;

-- Add index for better query performance
CREATE INDEX idx_table_reservation_booking ON table_reservations(booking_id);
