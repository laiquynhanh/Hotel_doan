// ========================================
// DỊCH VỤ ĐẶT MÓN ĂN (Food Order Service)
// ========================================
// Xử lý logic liên quan đến:
// - Tạo đơn hàng mới (validate items, tính giá)
// - Hủy đơn hàng (check trạng thái)
// - Cập nhật trạng thái đơn hàng
// - Tìm đơn hàng theo user/ID
// - Tính tổng giá với số lượng

package com.example.services;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.domain.FoodItem;
import com.example.domain.FoodOrder;
import com.example.domain.FoodOrderItem;
import com.example.domain.FoodOrderStatus;
import com.example.domain.User;
import com.example.dto.FoodOrderCreateDTO;
import com.example.dto.FoodOrderDTO;
import com.example.dto.FoodOrderItemDTO;
import com.example.exception.BadRequestException;
import com.example.repositories.FoodItemRepository;
import com.example.repositories.FoodOrderRepository;
import com.example.repositories.UserRepository;

@Service
public class FoodOrderService {

    @Autowired
    private FoodOrderRepository foodOrderRepository;

    @Autowired
    private FoodItemRepository foodItemRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private com.example.repositories.BookingRepository bookingRepository;

    @Transactional
    public FoodOrderDTO createOrder(Long userId, FoodOrderCreateDTO createDTO) {
        System.out.println("[DEBUG] FoodOrderService.createOrder - Received bookingId: " + createDTO.getBookingId());
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Người dùng không tồn tại"));

        // Create order
        FoodOrder order = new FoodOrder();
        order.setUser(user);
        
        // Enforce booking linkage for all new food orders
        if (createDTO.getBookingId() == null) {
            System.out.println("[DEBUG] FoodOrderService.createOrder - No bookingId provided! Rejecting.");
            throw new BadRequestException("Đơn dịch vụ phải kèm theo bookingId");
        }
        System.out.println("[DEBUG] FoodOrderService.createOrder - Looking up booking with ID: " + createDTO.getBookingId());
        com.example.domain.Booking booking = bookingRepository.findById(createDTO.getBookingId())
            .orElseThrow(() -> new BadRequestException("Không tìm thấy booking tương ứng"));
        System.out.println("[DEBUG] FoodOrderService.createOrder - Found booking: " + booking.getId());
        order.setBooking(booking);
        
        order.setRoomNumber(createDTO.getRoomNumber());
        order.setSpecialInstructions(createDTO.getSpecialInstructions());
        order.setStatus(FoodOrderStatus.PENDING);

        // Calculate total and add items
        BigDecimal totalPrice = BigDecimal.ZERO;
        List<FoodOrderItem> orderItems = new ArrayList<>();

        for (FoodOrderItemDTO itemDTO : createDTO.getItems()) {
            FoodItem foodItem = foodItemRepository.findById(itemDTO.getFoodItemId())
                    .orElseThrow(() -> new RuntimeException("Món ăn không tồn tại: " + itemDTO.getFoodItemId()));

            if (!foodItem.getAvailable()) {
                throw new BadRequestException("Món " + foodItem.getName() + " hiện không có sẵn");
            }

            BigDecimal itemTotal = foodItem.getPrice().multiply(new BigDecimal(itemDTO.getQuantity()));
            totalPrice = totalPrice.add(itemTotal);

            FoodOrderItem orderItem = new FoodOrderItem();
            orderItem.setOrder(order);
            orderItem.setFoodItem(foodItem);
            orderItem.setQuantity(itemDTO.getQuantity());
            orderItem.setPrice(foodItem.getPrice());
            orderItems.add(orderItem);
        }

        order.setTotalPrice(totalPrice);
        order.setItems(orderItems);

        FoodOrder savedOrder = foodOrderRepository.save(order);
        return convertToDTO(savedOrder);
    }

    public List<FoodOrderDTO> getUserOrders(Long userId) {
        return foodOrderRepository.findByUserIdOrderByOrderTimeDesc(userId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public FoodOrderDTO getOrderById(Long orderId) {
        FoodOrder order = foodOrderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Đơn hàng không tồn tại"));
        return convertToDTO(order);
    }

    // Admin methods
    public List<FoodOrderDTO> getAllOrders() {
        return foodOrderRepository.findAllByOrderByOrderTimeDesc().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<FoodOrderDTO> getOrdersByStatus(FoodOrderStatus status) {
        return foodOrderRepository.findByStatus(status).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public FoodOrderDTO updateOrderStatus(Long orderId, FoodOrderStatus status) {
        FoodOrder order = foodOrderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Đơn hàng không tồn tại"));
        
        order.setStatus(status);
        
        if (status == FoodOrderStatus.DELIVERED && order.getDeliveryTime() == null) {
            order.setDeliveryTime(LocalDateTime.now());
        }
        
        FoodOrder updatedOrder = foodOrderRepository.save(order);
        return convertToDTO(updatedOrder);
    }

    @Transactional
    public void cancelOrder(Long orderId, Long userId) {
        FoodOrder order = foodOrderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Đơn hàng không tồn tại"));
        
        if (!order.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("Bạn không có quyền hủy đơn hàng này");
        }
        
        if (order.getStatus() != FoodOrderStatus.PENDING && order.getStatus() != FoodOrderStatus.CONFIRMED) {
            throw new IllegalArgumentException("Không thể hủy đơn hàng đang được xử lý");
        }
        
        order.setStatus(FoodOrderStatus.CANCELLED);
        foodOrderRepository.save(order);
    }

    private FoodOrderDTO convertToDTO(FoodOrder order) {
        FoodOrderDTO dto = new FoodOrderDTO();
        dto.setId(order.getId());
        dto.setUserId(order.getUser().getId());
        dto.setUserName(order.getUser().getFullName());
        dto.setBookingId(order.getBooking() != null ? order.getBooking().getId() : null);
        dto.setRoomNumber(order.getRoomNumber());
        dto.setOrderTime(order.getOrderTime());
        dto.setDeliveryTime(order.getDeliveryTime());
        dto.setStatus(order.getStatus());
        dto.setTotalPrice(order.getTotalPrice());
        dto.setSpecialInstructions(order.getSpecialInstructions());
        
        List<FoodOrderItemDTO> itemDTOs = order.getItems().stream()
                .map(item -> new FoodOrderItemDTO(
                    item.getFoodItem().getId(),
                    item.getFoodItem().getName(),
                    item.getQuantity(),
                    item.getPrice()
                ))
                .collect(Collectors.toList());
        dto.setItems(itemDTOs);
        
        return dto;
    }
}
