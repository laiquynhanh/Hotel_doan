package com.example.domain;

public enum FoodOrderStatus {
    PENDING,        // Chờ xác nhận
    CONFIRMED,      // Đã xác nhận
    PREPARING,      // Đang chuẩn bị
    DELIVERING,     // Đang giao
    DELIVERED,      // Đã giao
    CANCELLED       // Đã hủy
}
