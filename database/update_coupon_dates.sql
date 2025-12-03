-- Update coupon dates to ensure they are valid
UPDATE coupons 
SET valid_from = NOW(),
    valid_until = DATE_ADD(NOW(), INTERVAL 90 DAY)
WHERE code = 'WELCOME10';

UPDATE coupons 
SET valid_from = NOW(),
    valid_until = '2025-12-31 23:59:59'
WHERE code = 'SUMMER2025';

UPDATE coupons 
SET valid_from = NOW(),
    valid_until = DATE_ADD(NOW(), INTERVAL 365 DAY)
WHERE code = 'VIP20';

-- Verify
SELECT code, description, discount_type, discount_value, 
       valid_from, valid_until, active, used_count, usage_limit
FROM coupons;
