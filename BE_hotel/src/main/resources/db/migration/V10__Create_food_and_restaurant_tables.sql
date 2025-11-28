-- Food Items Table
CREATE TABLE food_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    description TEXT,
    image_url VARCHAR(500),
    available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Food Orders Table
CREATE TABLE food_orders (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    booking_id BIGINT,
    user_id BIGINT NOT NULL,
    room_number VARCHAR(50),
    order_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    delivery_time TIMESTAMP NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    total_price DECIMAL(10, 2) NOT NULL,
    special_instructions TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE SET NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Food Order Items Table
CREATE TABLE food_order_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT NOT NULL,
    food_item_id BIGINT NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES food_orders(id) ON DELETE CASCADE,
    FOREIGN KEY (food_item_id) REFERENCES food_items(id) ON DELETE CASCADE
);

-- Restaurant Tables Table
CREATE TABLE restaurant_tables (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    table_number VARCHAR(50) NOT NULL UNIQUE,
    capacity INT NOT NULL,
    location VARCHAR(100),
    status VARCHAR(50) NOT NULL DEFAULT 'AVAILABLE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Table Reservations Table
CREATE TABLE table_reservations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    table_id BIGINT NOT NULL,
    user_id BIGINT,
    guest_name VARCHAR(255) NOT NULL,
    guest_phone VARCHAR(20) NOT NULL,
    guest_email VARCHAR(255),
    reservation_date DATE NOT NULL,
    reservation_time TIME NOT NULL,
    party_size INT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    special_requests TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (table_id) REFERENCES restaurant_tables(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Indexes for better query performance
CREATE INDEX idx_food_orders_user_id ON food_orders(user_id);
CREATE INDEX idx_food_orders_booking_id ON food_orders(booking_id);
CREATE INDEX idx_food_orders_status ON food_orders(status);
CREATE INDEX idx_food_order_items_order_id ON food_order_items(order_id);
CREATE INDEX idx_table_reservations_table_id ON table_reservations(table_id);
CREATE INDEX idx_table_reservations_date_time ON table_reservations(reservation_date, reservation_time);
CREATE INDEX idx_table_reservations_status ON table_reservations(status);
