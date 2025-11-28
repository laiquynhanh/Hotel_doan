-- Insert admin user
-- Username: thuy
-- Password: 123456 (BCrypt encrypted with strength 10)
-- Role: ADMIN
-- BCrypt hash: $2a$10$tB2FA4ygB1tom6fQMJK.yukKdi0WoJFt.nWzmVR5c113kk5u49OpO
INSERT INTO users (username, password, email, full_name, role) VALUES
('thuy', '$2a$10$tB2FA4ygB1tom6fQMJK.yukKdi0WoJFt.nWzmVR5c113kk5u49OpO', 'thuy@hotel.com', 'Admin Thuy', 'ADMIN');
