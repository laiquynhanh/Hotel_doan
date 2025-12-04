package com.example.dto;

import java.util.List;

import jakarta.validation.constraints.NotEmpty;

public class FoodOrderCreateDTO {
    private Long bookingId;
    private String roomNumber;
    
    @NotEmpty(message = "Phải có ít nhất một món")
    private List<FoodOrderItemDTO> items;
    
    private String specialInstructions;

    public FoodOrderCreateDTO() {}

    public FoodOrderCreateDTO(String roomNumber, List<FoodOrderItemDTO> items, String specialInstructions) {
        this.roomNumber = roomNumber;
        this.items = items;
        this.specialInstructions = specialInstructions;
    }

    // Getters and Setters
    public Long getBookingId() {
        return bookingId;
    }

    public void setBookingId(Long bookingId) {
        this.bookingId = bookingId;
    }

    public String getRoomNumber() {
        return roomNumber;
    }

    public void setRoomNumber(String roomNumber) {
        this.roomNumber = roomNumber;
    }

    public List<FoodOrderItemDTO> getItems() {
        return items;
    }

    public void setItems(List<FoodOrderItemDTO> items) {
        this.items = items;
    }

    public String getSpecialInstructions() {
        return specialInstructions;
    }

    public void setSpecialInstructions(String specialInstructions) {
        this.specialInstructions = specialInstructions;
    }
}
