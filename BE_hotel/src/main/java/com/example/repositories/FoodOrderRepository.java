package com.example.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.domain.FoodOrder;
import com.example.domain.FoodOrderStatus;
import com.example.domain.User;

@Repository
public interface FoodOrderRepository extends JpaRepository<FoodOrder, Long> {
    
    List<FoodOrder> findByUser(User user);
    
    List<FoodOrder> findByUserId(Long userId);
    
    List<FoodOrder> findByStatus(FoodOrderStatus status);
    
    List<FoodOrder> findByUserIdOrderByOrderTimeDesc(Long userId);
    
    List<FoodOrder> findAllByOrderByOrderTimeDesc();
    
    Long countByStatus(FoodOrderStatus status);
}
