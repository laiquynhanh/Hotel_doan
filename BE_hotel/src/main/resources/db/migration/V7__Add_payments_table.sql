-- Flyway migration: add payments table
CREATE TABLE IF NOT EXISTS payments (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  booking_id BIGINT NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  payment_method VARCHAR(50) NOT NULL,
  status VARCHAR(20) NOT NULL,
  transaction_id VARCHAR(255),
  bank_code VARCHAR(50),
  card_type VARCHAR(50),
  description VARCHAR(1000),
  created_at DATETIME NOT NULL,
  paid_at DATETIME,
  CONSTRAINT fk_payments_booking FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
);
