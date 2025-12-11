// Repository quản lý FoodItem: query mục thực đơn theo danh mục, tên, giá
package com.example.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.domain.FoodCategory;
import com.example.domain.FoodItem;

@Repository
public interface FoodItemRepository extends JpaRepository<FoodItem, Long> {
    
    List<FoodItem> findByCategory(FoodCategory category);
    
    List<FoodItem> findByAvailable(Boolean available);
    
    List<FoodItem> findByCategoryAndAvailable(FoodCategory category, Boolean available);
    
    List<FoodItem> findByNameContainingIgnoreCase(String name);
}
