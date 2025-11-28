-- Create category table and add category_id to rooms
CREATE TABLE category (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  slug VARCHAR(255),
  description VARCHAR(1000),
  image_url VARCHAR(1024),
  active BOOLEAN DEFAULT TRUE
);

-- Add category_id to rooms (nullable for backward compatibility)
ALTER TABLE rooms ADD COLUMN category_id BIGINT;
ALTER TABLE rooms ADD CONSTRAINT fk_room_category FOREIGN KEY (category_id) REFERENCES category(id);
