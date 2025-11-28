package com.example.controllers;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.domain.FoodItem;
import com.example.domain.FoodOrderStatus;
import com.example.dto.FoodOrderDTO;
import com.example.services.FoodOrderService;
import com.example.services.FoodService;

@RestController
@RequestMapping("/api/admin/food")
@PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
public class AdminFoodController {

    @Autowired
    private FoodService foodService;

    @Autowired
    private FoodOrderService foodOrderService;

    // Food Items Management
    @GetMapping("/items")
    public ResponseEntity<?> getAllFoodItems() {
        try {
            List<FoodItem> items = foodService.getAllFoodItems();
            return ResponseEntity.ok(items);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/items")
    public ResponseEntity<?> createFoodItem(@RequestBody FoodItem foodItem) {
        try {
            FoodItem created = foodService.createFoodItem(foodItem);
            return ResponseEntity.ok(created);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/items/{id}")
    public ResponseEntity<?> updateFoodItem(
            @PathVariable Long id,
            @RequestBody FoodItem foodItem) {
        try {
            FoodItem updated = foodService.updateFoodItem(id, foodItem);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/items/{id}")
    public ResponseEntity<?> deleteFoodItem(@PathVariable Long id) {
        try {
            foodService.deleteFoodItem(id);
            return ResponseEntity.ok().body("Đã xóa món ăn thành công");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/items/{id}/toggle-availability")
    public ResponseEntity<?> toggleAvailability(@PathVariable Long id) {
        try {
            foodService.toggleAvailability(id);
            return ResponseEntity.ok().body("Đã cập nhật trạng thái thành công");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Food Orders Management
    @GetMapping("/orders")
    public ResponseEntity<?> getAllOrders(@RequestParam(required = false) String status) {
        try {
            List<FoodOrderDTO> orders;
            if (status != null) {
                FoodOrderStatus orderStatus = FoodOrderStatus.valueOf(status.toUpperCase());
                orders = foodOrderService.getOrdersByStatus(orderStatus);
            } else {
                orders = foodOrderService.getAllOrders();
            }
            return ResponseEntity.ok(orders);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Trạng thái không hợp lệ");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/orders/{id}")
    public ResponseEntity<?> getOrderById(@PathVariable Long id) {
        try {
            FoodOrderDTO order = foodOrderService.getOrderById(id);
            return ResponseEntity.ok(order);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/orders/{id}/status")
    public ResponseEntity<?> updateOrderStatus(
            @PathVariable Long id,
            @RequestParam String status) {
        try {
            FoodOrderStatus orderStatus = FoodOrderStatus.valueOf(status.toUpperCase());
            FoodOrderDTO updated = foodOrderService.updateOrderStatus(id, orderStatus);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Trạng thái không hợp lệ");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
