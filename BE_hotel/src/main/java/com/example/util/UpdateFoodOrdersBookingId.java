package com.example.util;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;

// Run this once to update existing food orders with booking_id
// @Component - Uncomment to run again if needed
public class UpdateFoodOrdersBookingId implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(UpdateFoodOrdersBookingId.class);

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) throws Exception {
        logger.info("Starting to update food orders with booking_id...");
        
        // Update all food orders without booking_id by matching with active bookings
        String sql = """
            UPDATE food_orders fo
            JOIN rooms r ON r.room_number = fo.room_number
            JOIN bookings b ON b.room_id = r.id
                AND DATE(fo.order_time) BETWEEN b.check_in_date AND b.check_out_date
                AND b.status IN ('CONFIRMED', 'CHECKED_IN')
            SET fo.booking_id = b.id
            WHERE fo.booking_id IS NULL 
                AND fo.room_number IS NOT NULL
            """;
        
        int updated = jdbcTemplate.update(sql);
        
        logger.info("Updated {} food order(s) with booking_id", updated);
        
        if (updated > 0) {
            logger.info("Successfully linked old food orders to their bookings");
        }
    }
}
