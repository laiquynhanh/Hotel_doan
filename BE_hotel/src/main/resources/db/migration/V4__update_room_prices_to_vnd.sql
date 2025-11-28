-- Update room prices from USD to VND (multiply by ~25,000)
UPDATE rooms SET price_per_night = 1590000.00 WHERE room_type = 'SINGLE';
UPDATE rooms SET price_per_night = 1990000.00 WHERE room_type = 'DOUBLE';
UPDATE rooms SET price_per_night = 2990000.00 WHERE room_type = 'DELUXE';
UPDATE rooms SET price_per_night = 4990000.00 WHERE room_type = 'SUITE';
UPDATE rooms SET price_per_night = 3990000.00 WHERE room_type = 'FAMILY';
UPDATE rooms SET price_per_night = 5990000.00 WHERE room_type = 'PREMIUM';
