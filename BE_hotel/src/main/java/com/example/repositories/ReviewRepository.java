package com.example.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.domain.Review;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByRoomIdAndApprovedTrue(Long roomId);
    List<Review> findByUserId(Long userId);
    List<Review> findByApproved(Boolean approved);
    List<Review> findByRoomId(Long roomId);
}
