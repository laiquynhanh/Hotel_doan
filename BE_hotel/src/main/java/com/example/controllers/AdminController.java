package com.example.controllers;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.domain.Booking;
import com.example.domain.BookingStatus;
import com.example.domain.Role;
import com.example.domain.RoomStatus;
import com.example.domain.User;
import com.example.dto.BookingDTO;
import com.example.dto.DashboardStatsDTO;
import com.example.dto.RoomDTO;
import com.example.dto.UpdateProfileDTO;
import com.example.dto.UserDTO;
import com.example.repositories.BookingRepository;
import com.example.repositories.RoomRepository;
import com.example.repositories.UserRepository;
import com.example.services.BookingService;
import com.example.services.RoomService;
import com.example.services.UserService;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoomRepository roomRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private UserService userService;

    @Autowired
    private RoomService roomService;

    @Autowired
    private BookingService bookingService;

    // Dashboard Statistics
    @GetMapping("/dashboard/stats")
    public ResponseEntity<?> getDashboardStats() {
        try {
            Long totalUsers = userRepository.count();
            Long totalRooms = roomRepository.count();
            Long totalBookings = bookingRepository.count();
            
            Long pendingBookings = bookingRepository.countByStatus(BookingStatus.PENDING);
            Long confirmedBookings = bookingRepository.countByStatus(BookingStatus.CONFIRMED);
            Long checkedInBookings = bookingRepository.countByStatus(BookingStatus.CHECKED_IN);
            
            Long availableRooms = roomRepository.countByStatus(RoomStatus.AVAILABLE);
            Long occupiedRooms = roomRepository.countByStatus(RoomStatus.OCCUPIED);
            
            // Calculate total revenue
            List<Booking> allBookings = bookingRepository.findAll();
            Double totalRevenue = allBookings.stream()
                    .filter(b -> b.getStatus() == BookingStatus.CHECKED_OUT || 
                                 b.getStatus() == BookingStatus.CONFIRMED ||
                                 b.getStatus() == BookingStatus.CHECKED_IN)
                    .mapToDouble(b -> b.getTotalPrice().doubleValue())
                    .sum();
            
            // Calculate monthly revenue
            YearMonth currentMonth = YearMonth.now();
            LocalDate startOfMonth = currentMonth.atDay(1);
            LocalDate endOfMonth = currentMonth.atEndOfMonth();
            
            List<Booking> monthlyBookings = bookingRepository.findByCreatedAtBetween(
                    startOfMonth.atStartOfDay(),
                    endOfMonth.atTime(23, 59, 59)
            );
            
            Double monthlyRevenue = monthlyBookings.stream()
                    .filter(b -> b.getStatus() == BookingStatus.CHECKED_OUT || 
                                 b.getStatus() == BookingStatus.CONFIRMED ||
                                 b.getStatus() == BookingStatus.CHECKED_IN)
                    .mapToDouble(b -> b.getTotalPrice().doubleValue())
                    .sum();
            
            DashboardStatsDTO stats = new DashboardStatsDTO(
                    totalUsers, totalRooms, totalBookings,
                    pendingBookings, confirmedBookings, checkedInBookings,
                    availableRooms, occupiedRooms,
                    totalRevenue, monthlyRevenue
            );
            
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // User Management
    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers() {
        try {
            List<User> users = userRepository.findAll();
            List<UserDTO> userDTOs = users.stream()
                    .map(u -> new UserDTO(u.getId(), u.getUsername(), u.getEmail(), 
                                         u.getFullName(), u.getPhoneNumber(), u.getRole().name()))
                    .collect(Collectors.toList());
            return ResponseEntity.ok(userDTOs);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        try {
            userRepository.deleteById(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/users/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody UpdateProfileDTO dto) {
        try {
            User user = userRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            if (dto.getFullName() != null) user.setFullName(dto.getFullName());
            if (dto.getEmail() != null) user.setEmail(dto.getEmail());
            if (dto.getPhoneNumber() != null) user.setPhoneNumber(dto.getPhoneNumber());
            
            userRepository.save(user);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/users/{id}/role")
    public ResponseEntity<?> updateUserRole(@PathVariable Long id, @RequestParam String role) {
        try {
            User user = userRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            user.setRole(Role.valueOf(role));
            userRepository.save(user);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Room Management (delegated to RoomController but added here for convenience)
    @GetMapping("/rooms")
    public ResponseEntity<?> getAllRooms() {
        try {
            List<RoomDTO> rooms = roomService.getAllRooms();
            return ResponseEntity.ok(rooms);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Booking Management
    @GetMapping("/bookings")
    public ResponseEntity<?> getAllBookings() {
        try {
            List<BookingDTO> bookings = bookingService.getAllBookings();
            return ResponseEntity.ok(bookings);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/bookings/{id}/status")
    public ResponseEntity<?> updateBookingStatus(
            @PathVariable Long id,
            @RequestParam BookingStatus status) {
        try {
            BookingDTO updatedBooking = bookingService.updateBookingStatus(id, status);
            return ResponseEntity.ok(updatedBooking);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/bookings/{id}")
    public ResponseEntity<?> deleteBooking(@PathVariable Long id) {
        try {
            bookingRepository.deleteById(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
