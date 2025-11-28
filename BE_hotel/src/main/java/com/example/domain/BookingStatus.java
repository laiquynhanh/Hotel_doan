package com.example.domain;

public enum BookingStatus {
    PENDING,        // Chờ xác nhận
    CONFIRMED,      // Đã xác nhận
    CHECKED_IN,     // Đã check-in
    CHECKED_OUT,    // Đã check-out
    CANCELLED       // Đã hủy
}
