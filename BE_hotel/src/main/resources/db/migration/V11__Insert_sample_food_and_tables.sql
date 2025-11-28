-- Insert sample food items
INSERT INTO food_items (name, category, price, description, image_url, available) VALUES
-- Breakfast
('Phở Bò', 'BREAKFAST', 85000, 'Phở bò truyền thống Hà Nội với nước dùng thơm ngon', '/img/food/pho-bo.jpg', TRUE),
('Bánh Mì Thịt', 'BREAKFAST', 35000, 'Bánh mì Sài Gòn với thịt nguội, pate, rau sống', '/img/food/banh-mi.jpg', TRUE),
('Cơm Tấm Sườn', 'BREAKFAST', 65000, 'Cơm tấm sườn nướng, trứng ốp la, bì, chả', '/img/food/com-tam.jpg', TRUE),
('Trứng Ốp La', 'BREAKFAST', 25000, 'Trứng ốp la với bánh mì nướng', '/img/food/trung-opla.jpg', TRUE),

-- Lunch/Dinner
('Bún Chả Hà Nội', 'LUNCH', 95000, 'Bún chả Hà Nội truyền thống với thịt nướng', '/img/food/bun-cha.jpg', TRUE),
('Bò Lúc Lắc', 'LUNCH', 125000, 'Bò lúc lắc với khoai tây chiên và salad', '/img/food/bo-luc-lac.jpg', TRUE),
('Gà Nướng Mật Ong', 'DINNER', 135000, 'Gà nướng mật ong thơm phức với rau củ', '/img/food/ga-nuong.jpg', TRUE),
('Tôm Hùm Nướng Phô Mai', 'DINNER', 450000, 'Tôm hùm nướng phô mai cao cấp', '/img/food/tom-hum.jpg', TRUE),
('Cá Hồi Áp Chảo', 'DINNER', 185000, 'Cá hồi áp chảo với sốt bơ chanh', '/img/food/ca-hoi.jpg', TRUE),
('Sườn Nướng BBQ', 'LUNCH', 145000, 'Sườn heo nướng BBQ kiểu Mỹ', '/img/food/suon-nuong.jpg', TRUE),

-- Drinks
('Cà Phê Sữa Đá', 'DRINKS', 35000, 'Cà phê phin truyền thống với sữa đá', '/img/food/cafe-sua.jpg', TRUE),
('Sinh Tố Bơ', 'DRINKS', 45000, 'Sinh tố bơ béo ngậy', '/img/food/sinh-to-bo.jpg', TRUE),
('Nước Dừa Tươi', 'DRINKS', 40000, 'Nước dừa tươi mát lạnh', '/img/food/nuoc-dua.jpg', TRUE),
('Trà Đào Cam Sả', 'DRINKS', 55000, 'Trà đào cam sả ngọt mát', '/img/food/tra-dao.jpg', TRUE),
('Bia Tiger', 'DRINKS', 40000, 'Bia Tiger lon 330ml', '/img/food/bia-tiger.jpg', TRUE),
('Nước Cam Ép', 'DRINKS', 50000, 'Nước cam tươi ép 100%', '/img/food/nuoc-cam.jpg', TRUE),

-- Desserts
('Chè Bưởi', 'DESSERT', 35000, 'Chè bưởi mát lạnh', '/img/food/che-buoi.jpg', TRUE),
('Bánh Flan', 'DESSERT', 30000, 'Bánh flan caramel truyền thống', '/img/food/banh-flan.jpg', TRUE),
('Kem Tràng Tiền', 'DESSERT', 40000, 'Kem Tràng Tiền các vị', '/img/food/kem.jpg', TRUE),
('Hoa Quả Tươi', 'DESSERT', 60000, 'Đĩa hoa quả tươi theo mùa', '/img/food/hoa-qua.jpg', TRUE);

-- Insert restaurant tables
INSERT INTO restaurant_tables (table_number, capacity, location, status) VALUES
('T01', 2, 'Tầng 1 - Gần cửa sổ', 'AVAILABLE'),
('T02', 2, 'Tầng 1 - Gần cửa sổ', 'AVAILABLE'),
('T03', 4, 'Tầng 1 - Trung tâm', 'AVAILABLE'),
('T04', 4, 'Tầng 1 - Trung tâm', 'AVAILABLE'),
('T05', 6, 'Tầng 1 - Góc phòng', 'AVAILABLE'),
('T06', 8, 'Tầng 1 - VIP', 'AVAILABLE'),
('T07', 2, 'Tầng 2 - Ban công', 'AVAILABLE'),
('T08', 4, 'Tầng 2 - Ban công', 'AVAILABLE'),
('T09', 6, 'Tầng 2 - View sông', 'AVAILABLE'),
('T10', 10, 'Tầng 2 - VIP Suite', 'AVAILABLE');
