package com.example.dto;

import java.math.BigDecimal;

public class FoodOrderItemDTO {
    private Long foodItemId;
    private String foodItemName;
    private Integer quantity;
    private BigDecimal price;

    public FoodOrderItemDTO() {}

    public FoodOrderItemDTO(Long foodItemId, String foodItemName, Integer quantity, BigDecimal price) {
        this.foodItemId = foodItemId;
        this.foodItemName = foodItemName;
        this.quantity = quantity;
        this.price = price;
    }

    // Getters and Setters
    public Long getFoodItemId() {
        return foodItemId;
    }

    public void setFoodItemId(Long foodItemId) {
        this.foodItemId = foodItemId;
    }

    public String getFoodItemName() {
        return foodItemName;
    }

    public void setFoodItemName(String foodItemName) {
        this.foodItemName = foodItemName;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }
}
