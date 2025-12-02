package com.example.controllers;

import com.example.dto.ReviewDTO;
import com.example.services.JwtService;
import com.example.services.ReviewService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class ReviewController {

    @Autowired
    private ReviewService reviewService;

    @Autowired
    private JwtService jwtService;

    // Public endpoint - get approved reviews for a room
    @GetMapping("/reviews/room/{roomId}")
    public ResponseEntity<?> getReviewsByRoom(@PathVariable Long roomId) {
        try {
            List<ReviewDTO> reviews = reviewService.getReviewsByRoom(roomId, true);
            return ResponseEntity.ok(reviews);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // User endpoint - get my reviews
    @GetMapping("/reviews/my-reviews")
    public ResponseEntity<?> getMyReviews(@RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.replace("Bearer ", "");
            Long userId = jwtService.extractUserId(token);
            List<ReviewDTO> reviews = reviewService.getReviewsByUser(userId);
            return ResponseEntity.ok(reviews);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // User endpoint - create review
    @PostMapping("/reviews")
    public ResponseEntity<?> createReview(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody ReviewDTO dto) {
        try {
            String token = authHeader.replace("Bearer ", "");
            Long userId = jwtService.extractUserId(token);
            ReviewDTO created = reviewService.createReview(userId, dto);
            return ResponseEntity.ok(created);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Admin endpoints
    @GetMapping("/admin/reviews")
    public ResponseEntity<?> getAllReviews() {
        try {
            List<ReviewDTO> reviews = reviewService.getAllReviews();
            return ResponseEntity.ok(reviews);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/admin/reviews/pending")
    public ResponseEntity<?> getPendingReviews() {
        try {
            List<ReviewDTO> reviews = reviewService.getPendingReviews();
            return ResponseEntity.ok(reviews);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/admin/reviews/room/{roomId}")
    public ResponseEntity<?> getReviewsByRoomAdmin(@PathVariable Long roomId) {
        try {
            List<ReviewDTO> reviews = reviewService.getReviewsByRoom(roomId, false);
            return ResponseEntity.ok(reviews);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/admin/reviews/{id}/approve")
    public ResponseEntity<?> approveReview(@PathVariable Long id) {
        try {
            ReviewDTO updated = reviewService.approveReview(id);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/admin/reviews/{id}/respond")
    public ResponseEntity<?> respondToReview(@PathVariable Long id, @RequestBody Map<String, String> body) {
        try {
            String response = body.get("response");
            ReviewDTO updated = reviewService.respondToReview(id, response);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/admin/reviews/{id}")
    public ResponseEntity<?> deleteReview(@PathVariable Long id) {
        try {
            reviewService.deleteReview(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
