// DTO thông tin phòng (ID, loại, giá, dung tích, kích thước, tiển ích, trạng thái)
package com.example.dto;

import java.math.BigDecimal;

import com.example.domain.RoomStatus;
import com.example.domain.RoomType;

public class RoomDTO {
    private Long id;
    private String roomNumber;
    private RoomType roomType;
    private String roomTypeName;
    private BigDecimal pricePerNight;
    private RoomStatus status;
    private Integer capacity;
    private Integer size;
    private String description;
    private String imageUrl;
    private String amenities;
    private com.example.dto.CategoryDTO category;
    // Availability info (computed when searching)
    private Boolean available;
    private java.time.LocalDate availableFrom;
    private Integer daysUntilAvailable;

    public RoomDTO() {
    }

    public RoomDTO(Long id, String roomNumber, RoomType roomType, BigDecimal pricePerNight,
                   RoomStatus status, Integer capacity, Integer size, String description,
                   String imageUrl, String amenities) {
        this.id = id;
        this.roomNumber = roomNumber;
        this.roomType = roomType;
        this.roomTypeName = roomType.getDisplayName();
        this.pricePerNight = pricePerNight;
        this.status = status;
        this.capacity = capacity;
        this.size = size;
        this.description = description;
        this.imageUrl = imageUrl;
        this.amenities = amenities;
        this.available = true; // default
    }

    public com.example.dto.CategoryDTO getCategory() {
        return category;
    }

    public void setCategory(com.example.dto.CategoryDTO category) {
        this.category = category;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getRoomNumber() { return roomNumber; }
    public void setRoomNumber(String roomNumber) { this.roomNumber = roomNumber; }

    public RoomType getRoomType() { return roomType; }
    public void setRoomType(RoomType roomType) { 
        this.roomType = roomType;
        this.roomTypeName = roomType != null ? roomType.getDisplayName() : null;
    }

    public String getRoomTypeName() { return roomTypeName; }
    public void setRoomTypeName(String roomTypeName) { this.roomTypeName = roomTypeName; }

    public BigDecimal getPricePerNight() { return pricePerNight; }
    public void setPricePerNight(BigDecimal pricePerNight) { this.pricePerNight = pricePerNight; }

    public RoomStatus getStatus() { return status; }
    public void setStatus(RoomStatus status) { this.status = status; }

    public Integer getCapacity() { return capacity; }
    public void setCapacity(Integer capacity) { this.capacity = capacity; }

    public Integer getSize() { return size; }
    public void setSize(Integer size) { this.size = size; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public String getAmenities() { return amenities; }
    public void setAmenities(String amenities) { this.amenities = amenities; }

    public Boolean getAvailable() { return available; }
    public void setAvailable(Boolean available) { this.available = available; }

    public java.time.LocalDate getAvailableFrom() { return availableFrom; }
    public void setAvailableFrom(java.time.LocalDate availableFrom) { this.availableFrom = availableFrom; }

    public Integer getDaysUntilAvailable() { return daysUntilAvailable; }
    public void setDaysUntilAvailable(Integer daysUntilAvailable) { this.daysUntilAvailable = daysUntilAvailable; }
}
