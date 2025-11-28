package com.example.controllers;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.domain.FoodCategory;
import com.example.domain.FoodItem;
import com.example.services.FoodService;

@RestController
@RequestMapping("/api/food")
public class FoodController {

    @Autowired
    private FoodService foodService;

    @GetMapping
    public ResponseEntity<List<FoodItem>> getAllFoodItems() {
        try {
            List<FoodItem> items = foodService.getAvailableFoodItems();
            return ResponseEntity.ok(items);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getFoodItemById(@PathVariable Long id) {
        try {
            FoodItem item = foodService.getFoodItemById(id);
            return ResponseEntity.ok(item);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<?> getFoodItemsByCategory(@PathVariable String category) {
        try {
            FoodCategory foodCategory = FoodCategory.valueOf(category.toUpperCase());
            List<FoodItem> items = foodService.getFoodItemsByCategory(foodCategory);
            return ResponseEntity.ok(items);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Danh mục không hợp lệ");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/search")
    public ResponseEntity<?> searchFoodItems(@RequestParam String keyword) {
        try {
            List<FoodItem> items = foodService.searchFoodItems(keyword);
            return ResponseEntity.ok(items);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
