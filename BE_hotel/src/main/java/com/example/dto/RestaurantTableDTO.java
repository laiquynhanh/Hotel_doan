package com.example.dto;

import com.example.domain.TableStatus;

public class RestaurantTableDTO {
    private Long id;
    private String tableNumber;
    private Integer capacity;
    private String location;
    private TableStatus status;

    public RestaurantTableDTO() {}

    public RestaurantTableDTO(Long id, String tableNumber, Integer capacity, String location, TableStatus status) {
        this.id = id;
        this.tableNumber = tableNumber;
        this.capacity = capacity;
        this.location = location;
        this.status = status;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTableNumber() {
        return tableNumber;
    }

    public void setTableNumber(String tableNumber) {
        this.tableNumber = tableNumber;
    }

    public Integer getCapacity() {
        return capacity;
    }

    public void setCapacity(Integer capacity) {
        this.capacity = capacity;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public TableStatus getStatus() {
        return status;
    }

    public void setStatus(TableStatus status) {
        this.status = status;
    }
}
