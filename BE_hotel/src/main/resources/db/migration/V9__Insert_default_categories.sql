-- Thêm các category mặc định cho hệ thống khách sạn
-- Insert default categories for hotel room classification

INSERT INTO category (name, slug, description, image_url, active) 
VALUES 
    ('Phòng Đơn', 'phong-don', 'Phòng dành cho 1 người với 1 giường đơn, phù hợp cho khách đi công tác hoặc du lịch một mình', '/img/category/single-room.jpg', true),
    ('Phòng Đôi', 'phong-doi', 'Phòng có 1 giường đôi hoặc 2 giường đơn, phù hợp cho cặp đôi hoặc 2 người bạn', '/img/category/double-room.jpg', true),
    ('Phòng Gia Đình', 'phong-gia-dinh', 'Phòng rộng rãi với nhiều giường, phù hợp cho gia đình có trẻ em (3-4 người)', '/img/category/family-room.jpg', true),
    ('Phòng Suite', 'phong-suite', 'Phòng hạng sang với không gian riêng biệt cho phòng khách và phòng ngủ', '/img/category/suite-room.jpg', true),
    ('Phòng Deluxe', 'phong-deluxe', 'Phòng cao cấp với nội thất sang trọng và view đẹp', '/img/category/deluxe-room.jpg', true),
    ('Phòng VIP', 'phong-vip', 'Phòng đẳng cấp nhất với đầy đủ tiện nghi cao cấp và dịch vụ đặc biệt', '/img/category/vip-room.jpg', true);
