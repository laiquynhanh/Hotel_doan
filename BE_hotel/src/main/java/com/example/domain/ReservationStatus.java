package com.example.domain;

public enum ReservationStatus {
    PENDING,        // Chờ xác nhận
    CONFIRMED,      // Đã xác nhận
    SEATED,         // Đã vào bàn
    COMPLETED,      // Hoàn thành
    CANCELLED,      // Đã hủy
    NO_SHOW         // Không đến
}
