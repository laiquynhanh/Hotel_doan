package com.example.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.domain.FoodOrderItem;

@Repository
public interface FoodOrderItemRepository extends JpaRepository<FoodOrderItem, Long> {
    // Basic CRUD operations are inherited from JpaRepository
}
