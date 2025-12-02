package com.example.services;

import com.example.domain.Booking;
import com.example.domain.Review;
import com.example.domain.Room;
import com.example.domain.User;
import com.example.dto.ReviewDTO;
import com.example.repositories.BookingRepository;
import com.example.repositories.ReviewRepository;
import com.example.repositories.RoomRepository;
import com.example.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ReviewService {

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoomRepository roomRepository;

    @Autowired
    private BookingRepository bookingRepository;

    public List<ReviewDTO> getAllReviews() {
        return reviewRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<ReviewDTO> getReviewsByRoom(Long roomId, Boolean approvedOnly) {
        List<Review> reviews;
        if (approvedOnly != null && approvedOnly) {
            reviews = reviewRepository.findByRoomIdAndApprovedTrue(roomId);
        } else {
            reviews = reviewRepository.findByRoomId(roomId);
        }
        return reviews.stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    public List<ReviewDTO> getReviewsByUser(Long userId) {
        return reviewRepository.findByUserId(userId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<ReviewDTO> getPendingReviews() {
        return reviewRepository.findByApproved(false).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public ReviewDTO createReview(Long userId, ReviewDTO dto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        Room room = roomRepository.findById(dto.getRoomId())
                .orElseThrow(() -> new RuntimeException("Room not found"));

        // Check if user has completed booking for this room
        if (dto.getBookingId() != null) {
            Booking booking = bookingRepository.findById(dto.getBookingId())
                    .orElseThrow(() -> new RuntimeException("Booking not found"));
            
            if (!booking.getUser().getId().equals(userId)) {
                throw new RuntimeException("Bạn không có quyền đánh giá booking này");
            }
        }

        Review review = new Review();
        review.setUser(user);
        review.setRoom(room);
        if (dto.getBookingId() != null) {
            Booking booking = bookingRepository.findById(dto.getBookingId()).orElse(null);
            review.setBooking(booking);
        }
        review.setRating(dto.getRating());
        review.setComment(dto.getComment());
        review.setApproved(false); // Requires admin approval

        Review saved = reviewRepository.save(review);
        return convertToDTO(saved);
    }

    public ReviewDTO approveReview(Long id) {
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Review not found"));
        
        review.setApproved(true);
        Review updated = reviewRepository.save(review);
        return convertToDTO(updated);
    }

    public ReviewDTO respondToReview(Long id, String response) {
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Review not found"));
        
        review.setAdminResponse(response);
        review.setRespondedAt(LocalDateTime.now());
        Review updated = reviewRepository.save(review);
        return convertToDTO(updated);
    }

    public void deleteReview(Long id) {
        reviewRepository.deleteById(id);
    }

    private ReviewDTO convertToDTO(Review review) {
        ReviewDTO dto = new ReviewDTO();
        dto.setId(review.getId());
        dto.setUserId(review.getUser().getId());
        dto.setUserName(review.getUser().getFullName() != null ? review.getUser().getFullName() : review.getUser().getUsername());
        dto.setRoomId(review.getRoom().getId());
        dto.setRoomNumber(review.getRoom().getRoomNumber());
        dto.setRoomType(review.getRoom().getRoomType().getDisplayName());
        dto.setBookingId(review.getBooking() != null ? review.getBooking().getId() : null);
        dto.setRating(review.getRating());
        dto.setComment(review.getComment());
        dto.setAdminResponse(review.getAdminResponse());
        dto.setRespondedAt(review.getRespondedAt());
        dto.setApproved(review.getApproved());
        dto.setCreatedAt(review.getCreatedAt());
        return dto;
    }
}
