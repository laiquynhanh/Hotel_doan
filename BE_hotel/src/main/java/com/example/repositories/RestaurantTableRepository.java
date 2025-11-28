package com.example.repositories;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.domain.RestaurantTable;
import com.example.domain.TableStatus;

@Repository
public interface RestaurantTableRepository extends JpaRepository<RestaurantTable, Long> {
    
    Optional<RestaurantTable> findByTableNumber(String tableNumber);
    
    List<RestaurantTable> findByStatus(TableStatus status);
    
    List<RestaurantTable> findByCapacityGreaterThanEqual(Integer capacity);
    
    List<RestaurantTable> findByStatusAndCapacityGreaterThanEqual(TableStatus status, Integer capacity);
}
