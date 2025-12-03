-- Kiểm tra coupon hiện tại
SELECT 
    id, 
    code, 
    discount_type,
    discount_value,
    min_order_amount,
    max_discount_amount,
    active,
    usage_limit,
    used_count,
    valid_from,
    valid_until
FROM coupons 
WHERE code = '123123';

-- Nếu discount_value = 0 hoặc NULL, cập nhật lại
-- Ví dụ: giảm 100% (percentage) hoặc giảm 500,000đ (fixed)

-- Option 1: Giảm 100% (percentage)
UPDATE coupons 
SET 
    discount_type = 'PERCENTAGE',
    discount_value = 100,
    max_discount_amount = NULL,
    min_order_amount = 0,
    active = 1,
    usage_limit = 0,
    used_count = 0,
    valid_from = '2025-12-02 00:00:00',
    valid_until = '2026-12-31 23:59:59'
WHERE code = '123123';

-- Option 2: Giảm 500,000đ (fixed amount)
-- UPDATE coupons 
-- SET 
--     discount_type = 'FIXED_AMOUNT',
--     discount_value = 500000,
--     max_discount_amount = NULL,
--     min_order_amount = 0,
--     active = 1,
--     usage_limit = 0,
--     used_count = 0,
--     valid_from = '2025-12-02 00:00:00',
--     valid_until = '2026-12-31 23:59:59'
-- WHERE code = '123123';

-- Kiểm tra lại sau khi update
SELECT 
    id, 
    code, 
    discount_type,
    discount_value,
    min_order_amount,
    max_discount_amount,
    active,
    usage_limit,
    used_count,
    valid_from,
    valid_until
FROM coupons 
WHERE code = '123123';
