// CẤU HÌNH JWT: secret key, token expiry (24 giờ)
package com.example.config;

import org.springframework.context.annotation.Configuration;

@Configuration
public class JwtConfig {
    
    // Secret key for JWT signing (In production, use environment variable!)
    public static final String SECRET_KEY = "hotel_secret_key_change_this_in_production_2024_very_long_secret";
    
    // JWT token validity in milliseconds (24 hours)
    public static final long EXPIRATION_TIME = 86400000; // 24 hours
    
    // JWT token prefix
    public static final String TOKEN_PREFIX = "Bearer ";
    
    // Header string
    public static final String HEADER_STRING = "Authorization";
}
