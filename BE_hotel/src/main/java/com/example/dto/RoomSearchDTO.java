package com.example.dto;

import java.time.LocalDate;

public class RoomSearchDTO {
    private LocalDate checkInDate;
    private LocalDate checkOutDate;
    private String roomType;
    private Integer guests;

    public RoomSearchDTO() {
    }

    public RoomSearchDTO(LocalDate checkInDate, LocalDate checkOutDate, String roomType, Integer guests) {
        this.checkInDate = checkInDate;
        this.checkOutDate = checkOutDate;
        this.roomType = roomType;
        this.guests = guests;
    }

    // Getters and Setters
    public LocalDate getCheckInDate() { return checkInDate; }
    public void setCheckInDate(LocalDate checkInDate) { this.checkInDate = checkInDate; }

    public LocalDate getCheckOutDate() { return checkOutDate; }
    public void setCheckOutDate(LocalDate checkOutDate) { this.checkOutDate = checkOutDate; }

    public String getRoomType() { return roomType; }
    public void setRoomType(String roomType) { this.roomType = roomType; }

    public Integer getGuests() { return guests; }
    public void setGuests(Integer guests) { this.guests = guests; }
}
