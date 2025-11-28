package com.example.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Serve files from the local "uploads" folder under /uploads/**
        // Example: http://localhost:8080/uploads/images/<file>
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:uploads/");
    }
}
