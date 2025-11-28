package com.example.controllers;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.constants.ErrorMessages;
import com.example.domain.User;
import com.example.dto.FoodOrderCreateDTO;
import com.example.dto.FoodOrderDTO;
import com.example.exception.BadRequestException;
import com.example.exception.ResourceNotFoundException;
import com.example.services.FoodOrderService;
import com.example.services.UserService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/food-orders")
public class FoodOrderController {

    @Autowired
    private FoodOrderService foodOrderService;

    @Autowired
    private UserService userService;

    @PostMapping
    public ResponseEntity<FoodOrderDTO> createOrder(
            @Valid @RequestBody FoodOrderCreateDTO createDTO,
            Authentication authentication) {
        
        String username = authentication.getName();
        User user = userService.findByUsername(username);
        if (user == null) {
            throw new ResourceNotFoundException(ErrorMessages.USER_NOT_FOUND);
        }
        
        FoodOrderDTO order = foodOrderService.createOrder(user.getId(), createDTO);
        return ResponseEntity.ok(order);
    }

    @GetMapping("/my-orders")
    public ResponseEntity<List<FoodOrderDTO>> getMyOrders(Authentication authentication) {
        String username = authentication.getName();
        User user = userService.findByUsername(username);
        if (user == null) {
            throw new ResourceNotFoundException(ErrorMessages.USER_NOT_FOUND);
        }
        
        List<FoodOrderDTO> orders = foodOrderService.getUserOrders(user.getId());
        return ResponseEntity.ok(orders);
    }

    @GetMapping("/{id}")
    public ResponseEntity<FoodOrderDTO> getOrderById(
            @PathVariable Long id,
            Authentication authentication) {
        
        FoodOrderDTO order = foodOrderService.getOrderById(id);
        
        // Verify user owns this order
        String username = authentication.getName();
        User user = userService.findByUsername(username);
        if (user == null) {
            throw new ResourceNotFoundException(ErrorMessages.USER_NOT_FOUND);
        }
        
        if (!order.getUserId().equals(user.getId())) {
            throw new BadRequestException(ErrorMessages.FORBIDDEN);
        }
        
        return ResponseEntity.ok(order);
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<?> cancelOrder(
            @PathVariable Long id,
            Authentication authentication) {
        try {
            String username = authentication.getName();
            User user = userService.findByUsername(username);
            
            foodOrderService.cancelOrder(id, user.getId());
            return ResponseEntity.ok().body("Đã hủy đơn hàng thành công");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
