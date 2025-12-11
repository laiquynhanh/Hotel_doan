// ========================================
// DỊCH VỤ ĐẶT PHÒNG (Booking Service)
// ========================================
// Xử lý logic liên quan đến:
// - Tạo booking mới (validate ngày, số khách, phòng)
// - Hủy booking (check trạng thái)
// - Cập nhật trạng thái booking
// - Tìm booking theo user/ID
// - Kiểm tra phòng trống trong khoảng thời gian

package com.example.services;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.domain.Booking;
import com.example.domain.BookingStatus;
import com.example.domain.Room;
import com.example.domain.User;
import com.example.dto.BookingCreateDTO;
import com.example.dto.BookingDTO;
import com.example.dto.BookingDetailDTO;
import com.example.repositories.BookingRepository;
import com.example.repositories.RoomRepository;
import com.example.repositories.UserRepository;

@Service
public class BookingService {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private RoomRepository roomRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private com.example.services.CouponService couponService;

    public List<BookingDTO> getAllBookings() {
        return bookingRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public BookingDTO getBookingById(Long id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found"));
        return convertToDTO(booking);
    }

    public List<BookingDTO> getBookingsByUserId(Long userId) {
        return bookingRepository.findByUserId(userId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<BookingDetailDTO> getBookingDetailsByUserId(Long userId) {
        return bookingRepository.findByUserId(userId).stream()
                .map(this::convertToDetailDTO)
                .collect(Collectors.toList());
    }

    public BookingDTO createBooking(Long userId, BookingCreateDTO bookingDTO) {
        // Validate dates
        if (bookingDTO.getCheckInDate().isBefore(LocalDate.now())) {
            throw new IllegalArgumentException("Check-in date cannot be in the past");
        }
        if (bookingDTO.getCheckOutDate().isBefore(bookingDTO.getCheckInDate())) {
            throw new IllegalArgumentException("Check-out date must be after check-in date");
        }

        // Check user exists
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        // Check room exists
        Room room = roomRepository.findById(bookingDTO.getRoomId())
                .orElseThrow(() -> new IllegalArgumentException("Room not found"));

        // Check room availability
        List<Booking> conflicts = bookingRepository.findConflictingBookings(
                room.getId(),
                bookingDTO.getCheckInDate(),
                bookingDTO.getCheckOutDate()
        );

        if (!conflicts.isEmpty()) {
            throw new IllegalArgumentException("Room is not available for the selected dates");
        }

        // Check capacity
        if (bookingDTO.getNumberOfGuests() > room.getCapacity()) {
            throw new IllegalArgumentException("Number of guests exceeds room capacity");
        }

        // Calculate total price
        long nights = ChronoUnit.DAYS.between(bookingDTO.getCheckInDate(), bookingDTO.getCheckOutDate());
        BigDecimal totalPrice = room.getPricePerNight().multiply(BigDecimal.valueOf(nights));

        // Apply coupon if provided
        BigDecimal discountAmount = BigDecimal.ZERO;
        String couponCode = bookingDTO.getCouponCode();
        if (couponCode != null && !couponCode.trim().isEmpty()) {
            try {
                discountAmount = couponService.calculateDiscount(couponCode, totalPrice);
                totalPrice = totalPrice.subtract(discountAmount);
            } catch (Exception e) {
                // If coupon is invalid, ignore it (or throw error if strict validation required)
                // For now, we'll just ignore and proceed without discount
                couponCode = null;
                discountAmount = BigDecimal.ZERO;
            }
        }

        // Create booking
        Booking booking = new Booking();
        booking.setUser(user);
        booking.setRoom(room);
        booking.setCheckInDate(bookingDTO.getCheckInDate());
        booking.setCheckOutDate(bookingDTO.getCheckOutDate());
        booking.setNumberOfGuests(bookingDTO.getNumberOfGuests());
        booking.setTotalPrice(totalPrice);
        
        // Auto-confirm if total price is 0 (100% discount from coupon)
        if (totalPrice.compareTo(BigDecimal.ZERO) == 0) {
            booking.setStatus(BookingStatus.CONFIRMED);
        } else {
            booking.setStatus(BookingStatus.PENDING);
        }
        
        booking.setSpecialRequests(bookingDTO.getSpecialRequests());
        booking.setCouponCode(couponCode);
        booking.setDiscountAmount(discountAmount);
        
        // Note: If booking is confirmed automatically (e.g. totalPrice = 0), 
        // customer doesn't need to wait for manual confirmation
        // If booking requires payment via VNPay, it will be auto-confirmed after successful payment

        Booking savedBooking = bookingRepository.save(booking);
        return convertToDTO(savedBooking);
    }

    public BookingDTO updateBookingStatus(Long id, BookingStatus status) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        booking.setStatus(status);
        Booking updatedBooking = bookingRepository.save(booking);
        return convertToDTO(updatedBooking);
    }

    public BookingDTO updatePremiumServices(Long id, Boolean airportPickup, Boolean spaService, Boolean laundryService, Boolean tourGuide) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        if (airportPickup != null) {
            booking.setAirportPickup(airportPickup);
        }
        if (spaService != null) {
            booking.setSpaService(spaService);
        }
        if (laundryService != null) {
            booking.setLaundryService(laundryService);
        }
        if (tourGuide != null) {
            booking.setTourGuide(tourGuide);
        }

        Booking updatedBooking = bookingRepository.save(booking);
        return convertToDTO(updatedBooking);
    }

    public void cancelBooking(Long id, Long userId) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found"));

        if (!booking.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("You are not authorized to cancel this booking");
        }

        if (booking.getStatus() == BookingStatus.CHECKED_IN || 
            booking.getStatus() == BookingStatus.CHECKED_OUT) {
            throw new IllegalArgumentException("Cannot cancel a booking that is already checked-in or checked-out");
        }

        booking.setStatus(BookingStatus.CANCELLED);
        bookingRepository.save(booking);
    }

    private BookingDTO convertToDTO(Booking booking) {
        BookingDTO dto = new BookingDTO();
        dto.setId(booking.getId());
        dto.setUserId(booking.getUser().getId());
        dto.setUserName(booking.getUser().getFullName());
        dto.setRoomId(booking.getRoom().getId());
        dto.setRoomNumber(booking.getRoom().getRoomNumber());
        dto.setRoomType(booking.getRoom().getRoomType().getDisplayName());
        dto.setCheckInDate(booking.getCheckInDate());
        dto.setCheckOutDate(booking.getCheckOutDate());
        dto.setNumberOfGuests(booking.getNumberOfGuests());
        dto.setTotalPrice(booking.getTotalPrice());
        dto.setStatus(booking.getStatus());
        dto.setSpecialRequests(booking.getSpecialRequests());
        dto.setAirportPickup(booking.getAirportPickup());
        dto.setSpaService(booking.getSpaService());
        dto.setLaundryService(booking.getLaundryService());
        dto.setTourGuide(booking.getTourGuide());
        dto.setCouponCode(booking.getCouponCode());
        dto.setDiscountAmount(booking.getDiscountAmount());
        dto.setCreatedAt(booking.getCreatedAt());
        return dto;
    }

    private BookingDetailDTO convertToDetailDTO(Booking booking) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        
        BookingDetailDTO dto = new BookingDetailDTO();
        dto.setBookingId(booking.getId());
        
        // User info
        dto.setUserId(booking.getUser().getId());
        dto.setUsername(booking.getUser().getUsername());
        dto.setFullName(booking.getUser().getFullName());
        dto.setEmail(booking.getUser().getEmail());
        dto.setPhoneNumber(booking.getUser().getPhoneNumber());
        
        // Room info
        dto.setRoomId(booking.getRoom().getId());
        dto.setRoomNumber(booking.getRoom().getRoomNumber());
        dto.setRoomType(booking.getRoom().getRoomType());
        dto.setPricePerNight(booking.getRoom().getPricePerNight().doubleValue());
        dto.setImageUrl(booking.getRoom().getImageUrl());
        dto.setDescription(booking.getRoom().getDescription());
        
        // Booking info
        dto.setCheckInDate(booking.getCheckInDate().format(formatter));
        dto.setCheckOutDate(booking.getCheckOutDate().format(formatter));
        dto.setNumberOfGuests(booking.getNumberOfGuests());
        dto.setTotalPrice(booking.getTotalPrice().doubleValue());
        dto.setStatus(booking.getStatus());
        dto.setSpecialRequests(booking.getSpecialRequests());
        dto.setCreatedAt(booking.getCreatedAt() != null ? booking.getCreatedAt().toString() : "");
        
        return dto;
    }
}
