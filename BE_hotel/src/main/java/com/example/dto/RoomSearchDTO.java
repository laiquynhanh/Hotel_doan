package com.example.dto;

import java.time.LocalDate;

public class RoomSearchDTO {
    private LocalDate checkInDate;
    private LocalDate checkOutDate;
    private String roomType;
    private Integer minCapacity;
    private Double minPrice;
    private Double maxPrice;

    public RoomSearchDTO() {
    }

    public RoomSearchDTO(LocalDate checkInDate, LocalDate checkOutDate, String roomType, Integer minCapacity) {
        this.checkInDate = checkInDate;
        this.checkOutDate = checkOutDate;
        this.roomType = roomType;
        this.minCapacity = minCapacity;
    }

    // Getters and Setters
    public LocalDate getCheckInDate() { return checkInDate; }
    public void setCheckInDate(LocalDate checkInDate) { this.checkInDate = checkInDate; }

    public LocalDate getCheckOutDate() { return checkOutDate; }
    public void setCheckOutDate(LocalDate checkOutDate) { this.checkOutDate = checkOutDate; }

    public String getRoomType() { return roomType; }
    public void setRoomType(String roomType) { this.roomType = roomType; }

    public Integer getMinCapacity() { return minCapacity; }
    public void setMinCapacity(Integer minCapacity) { this.minCapacity = minCapacity; }
    
    public Double getMinPrice() { return minPrice; }
    public void setMinPrice(Double minPrice) { this.minPrice = minPrice; }
    
    public Double getMaxPrice() { return maxPrice; }
    public void setMaxPrice(Double maxPrice) { this.maxPrice = maxPrice; }
}
