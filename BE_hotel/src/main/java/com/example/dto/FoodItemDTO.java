// DTO mục thực đơn (ID, tên, mô tả, giá, hình ảnh, danh mục)
package com.example.dto;

import java.math.BigDecimal;

import com.example.domain.FoodCategory;

public class FoodItemDTO {
    private Long id;
    private String name;
    private FoodCategory category;
    private BigDecimal price;
    private String description;
    private String imageUrl;
    private Boolean available;
    private Integer stockQuantity;

    public FoodItemDTO() {}

    public FoodItemDTO(Long id, String name, FoodCategory category, BigDecimal price, 
                      String description, String imageUrl, Boolean available, Integer stockQuantity) {
        this.id = id;
        this.name = name;
        this.category = category;
        this.price = price;
        this.description = description;
        this.imageUrl = imageUrl;
        this.available = available;
        this.stockQuantity = stockQuantity;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public FoodCategory getCategory() {
        return category;
    }

    public void setCategory(FoodCategory category) {
        this.category = category;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public Boolean getAvailable() {
        return available;
    }

    public void setAvailable(Boolean available) {
        this.available = available;
    }

    public Integer getStockQuantity() {
        return stockQuantity;
    }

    public void setStockQuantity(Integer stockQuantity) {
        this.stockQuantity = stockQuantity;
    }
}
