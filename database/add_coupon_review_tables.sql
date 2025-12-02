-- Create Coupons Table
CREATE TABLE IF NOT EXISTS coupons (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    description VARCHAR(200) NOT NULL,
    discount_type VARCHAR(20) NOT NULL,
    discount_value DECIMAL(10,2) NOT NULL,
    min_order_amount DECIMAL(10,2),
    max_discount_amount DECIMAL(10,2),
    usage_limit INT,
    used_count INT DEFAULT 0,
    valid_from DATETIME NOT NULL,
    valid_until DATETIME NOT NULL,
    active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME
);

-- Create Reviews Table
CREATE TABLE IF NOT EXISTS reviews (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    room_id BIGINT NOT NULL,
    booking_id BIGINT,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    admin_response VARCHAR(500),
    responded_at DATETIME,
    approved BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE SET NULL
);

-- Add coupon field to bookings table
ALTER TABLE bookings 
ADD COLUMN coupon_code VARCHAR(50),
ADD COLUMN discount_amount DECIMAL(10,2) DEFAULT 0;

-- Insert sample coupons
INSERT INTO coupons (code, description, discount_type, discount_value, min_order_amount, max_discount_amount, usage_limit, valid_from, valid_until, active)
VALUES 
('WELCOME10', 'Giảm 10% cho khách hàng mới', 'PERCENTAGE', 10.00, 1000000, 500000, 100, NOW(), DATE_ADD(NOW(), INTERVAL 90 DAY), TRUE),
('SUMMER2025', 'Giảm 500,000đ mùa hè 2025', 'FIXED_AMOUNT', 500000.00, 2000000, NULL, 50, NOW(), '2025-08-31 23:59:59', TRUE),
('VIP20', 'Giảm 20% cho khách VIP', 'PERCENTAGE', 20.00, 3000000, 1000000, NULL, NOW(), DATE_ADD(NOW(), INTERVAL 365 DAY), TRUE);

-- Create indexes for better performance
CREATE INDEX idx_coupon_code ON coupons(code);
CREATE INDEX idx_review_room ON reviews(room_id);
CREATE INDEX idx_review_user ON reviews(user_id);
CREATE INDEX idx_review_approved ON reviews(approved);
