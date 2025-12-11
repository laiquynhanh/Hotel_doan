// ========================================
// DỊCH VỤ THỰC ĐƠN (Food Service)
// ========================================
// Xử lý logic liên quan đến:
// - Quản lý danh sách món ăn, thức uống
// - Tìm kiếm, lọc thực đơn
// - Lấy chi tiết thông tin từng món
// - Hỗ trợ tìm kiếm theo tên, danh mục

package com.example.services;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.domain.FoodCategory;
import com.example.domain.FoodItem;
import com.example.repositories.FoodItemRepository;

@Service
public class FoodService {

    @Autowired
    private FoodItemRepository foodItemRepository;

    public List<FoodItem> getAllFoodItems() {
        return foodItemRepository.findAll();
    }

    public List<FoodItem> getAvailableFoodItems() {
        return foodItemRepository.findByAvailable(true);
    }

    public List<FoodItem> getFoodItemsByCategory(FoodCategory category) {
        return foodItemRepository.findByCategoryAndAvailable(category, true);
    }

    public FoodItem getFoodItemById(Long id) {
        return foodItemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Món ăn không tồn tại"));
    }

    public List<FoodItem> searchFoodItems(String keyword) {
        return foodItemRepository.findByNameContainingIgnoreCase(keyword);
    }

    // Admin methods
    public FoodItem createFoodItem(FoodItem foodItem) {
        return foodItemRepository.save(foodItem);
    }

    public FoodItem updateFoodItem(Long id, FoodItem foodItemDetails) {
        FoodItem foodItem = getFoodItemById(id);
        
        foodItem.setName(foodItemDetails.getName());
        foodItem.setCategory(foodItemDetails.getCategory());
        foodItem.setPrice(foodItemDetails.getPrice());
        foodItem.setDescription(foodItemDetails.getDescription());
        foodItem.setImageUrl(foodItemDetails.getImageUrl());
        foodItem.setAvailable(foodItemDetails.getAvailable());
        
        if (foodItemDetails.getStockQuantity() != null) {
            foodItem.setStockQuantity(foodItemDetails.getStockQuantity());
        }
        
        return foodItemRepository.save(foodItem);
    }

    public void deleteFoodItem(Long id) {
        FoodItem foodItem = getFoodItemById(id);
        foodItemRepository.delete(foodItem);
    }

    public void toggleAvailability(Long id) {
        FoodItem foodItem = getFoodItemById(id);
        foodItem.setAvailable(!foodItem.getAvailable());
        foodItemRepository.save(foodItem);
    }
}
