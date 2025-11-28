-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    full_name VARCHAR(255),
    role ENUM('USER', 'ADMIN', 'STAFF') NOT NULL DEFAULT 'USER'
);

-- Create rooms table
CREATE TABLE IF NOT EXISTS rooms (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    room_number VARCHAR(255) UNIQUE NOT NULL,
    room_type ENUM('SINGLE', 'DOUBLE', 'DELUXE', 'SUITE', 'FAMILY', 'PREMIUM') NOT NULL,
    price_per_night DECIMAL(10,2) NOT NULL,
    status ENUM('AVAILABLE', 'OCCUPIED', 'MAINTENANCE', 'CLEANING') NOT NULL DEFAULT 'AVAILABLE',
    capacity INT NOT NULL,
    size INT,
    description VARCHAR(500),
    image_url VARCHAR(255),
    amenities VARCHAR(1000)
);

-- Create bookings table
CREATE TABLE IF NOT EXISTS bookings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    room_id BIGINT NOT NULL,
    check_in_date DATE NOT NULL,
    check_out_date DATE NOT NULL,
    number_of_guests INT NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    status ENUM('PENDING', 'CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    special_requests VARCHAR(500),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (room_id) REFERENCES rooms(id)
);

-- Insert sample rooms
INSERT INTO rooms (room_number, room_type, price_per_night, status, capacity, size, description, image_url, amenities) VALUES
('101', 'SINGLE', 159.00, 'AVAILABLE', 2, 30, 'Phòng đơn cao cấp với view đẹp', '/img/room/room-1.jpg', 'WiFi,TV,AC,Mini Bar,Bathroom'),
('102', 'SINGLE', 159.00, 'AVAILABLE', 2, 30, 'Phòng đơn thoáng mát', '/img/room/room-2.jpg', 'WiFi,TV,AC,Bathroom'),
('201', 'DOUBLE', 199.00, 'AVAILABLE', 2, 40, 'Phòng đôi sang trọng', '/img/room/room-3.jpg', 'WiFi,TV,AC,Mini Bar,Bathtub,Balcony'),
('202', 'DOUBLE', 199.00, 'AVAILABLE', 2, 40, 'Phòng đôi view biển', '/img/room/room-4.jpg', 'WiFi,TV,AC,Mini Bar,Bathroom'),
('301', 'DELUXE', 299.00, 'AVAILABLE', 3, 50, 'Phòng Deluxe cao cấp', '/img/room/room-b1.jpg', 'WiFi,TV,AC,Mini Bar,Bathtub,Balcony,Safe Box'),
('302', 'DELUXE', 299.00, 'AVAILABLE', 3, 50, 'Phòng Deluxe view núi', '/img/room/room-b2.jpg', 'WiFi,TV,AC,Mini Bar,Bathtub,Balcony,Safe Box'),
('401', 'SUITE', 499.00, 'AVAILABLE', 4, 70, 'Phòng Suite VIP', '/img/room/room-b3.jpg', 'WiFi,TV,AC,Mini Bar,Jacuzzi,Balcony,Safe Box,Kitchen'),
('402', 'SUITE', 499.00, 'AVAILABLE', 4, 70, 'Phòng Suite Honeymoon', '/img/room/room-b4.jpg', 'WiFi,TV,AC,Mini Bar,Jacuzzi,Balcony,Safe Box,Kitchen'),
('501', 'FAMILY', 399.00, 'AVAILABLE', 6, 80, 'Phòng gia đình rộng rãi', '/img/room/room-1.jpg', 'WiFi,TV,AC,Mini Bar,2 Bathrooms,Balcony'),
('502', 'FAMILY', 399.00, 'AVAILABLE', 6, 80, 'Phòng gia đình view đẹp', '/img/room/room-2.jpg', 'WiFi,TV,AC,Mini Bar,2 Bathrooms,Balcony'),
('601', 'PREMIUM', 599.00, 'AVAILABLE', 3, 60, 'Phòng Premium tầng cao', '/img/room/room-3.jpg', 'WiFi,TV,AC,Mini Bar,Jacuzzi,Balcony,Safe Box,Butler Service'),
('602', 'PREMIUM', 599.00, 'AVAILABLE', 3, 60, 'Phòng Premium Penthouse', '/img/room/room-4.jpg', 'WiFi,TV,AC,Mini Bar,Jacuzzi,Balcony,Safe Box,Butler Service');
