package com.example.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import com.example.domain.FoodOrderStatus;

public class FoodOrderDTO {
    private Long id;
    private Long userId;
    private String userName;
    private String roomNumber;
    private LocalDateTime orderTime;
    private LocalDateTime deliveryTime;
    private FoodOrderStatus status;
    private BigDecimal totalPrice;
    private String specialInstructions;
    private List<FoodOrderItemDTO> items;

    public FoodOrderDTO() {}

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public String getRoomNumber() {
        return roomNumber;
    }

    public void setRoomNumber(String roomNumber) {
        this.roomNumber = roomNumber;
    }

    public LocalDateTime getOrderTime() {
        return orderTime;
    }

    public void setOrderTime(LocalDateTime orderTime) {
        this.orderTime = orderTime;
    }

    public LocalDateTime getDeliveryTime() {
        return deliveryTime;
    }

    public void setDeliveryTime(LocalDateTime deliveryTime) {
        this.deliveryTime = deliveryTime;
    }

    public FoodOrderStatus getStatus() {
        return status;
    }

    public void setStatus(FoodOrderStatus status) {
        this.status = status;
    }

    public BigDecimal getTotalPrice() {
        return totalPrice;
    }

    public void setTotalPrice(BigDecimal totalPrice) {
        this.totalPrice = totalPrice;
    }

    public String getSpecialInstructions() {
        return specialInstructions;
    }

    public void setSpecialInstructions(String specialInstructions) {
        this.specialInstructions = specialInstructions;
    }

    public List<FoodOrderItemDTO> getItems() {
        return items;
    }

    public void setItems(List<FoodOrderItemDTO> items) {
        this.items = items;
    }
}
