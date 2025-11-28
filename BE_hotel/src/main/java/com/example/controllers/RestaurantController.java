package com.example.controllers;

import java.time.LocalDate;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.domain.User;
import com.example.dto.RestaurantTableDTO;
import com.example.dto.TableReservationCreateDTO;
import com.example.dto.TableReservationDTO;
import com.example.services.RestaurantService;
import com.example.services.UserService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/restaurant")
public class RestaurantController {

    @Autowired
    private RestaurantService restaurantService;

    @Autowired
    private UserService userService;

    @GetMapping("/tables")
    public ResponseEntity<?> getAllTables(@RequestParam(required = false) Integer minCapacity) {
        try {
            List<RestaurantTableDTO> tables;
            if (minCapacity != null) {
                tables = restaurantService.getAvailableTables(minCapacity);
            } else {
                tables = restaurantService.getAllTables();
            }
            return ResponseEntity.ok(tables);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/tables/{id}")
    public ResponseEntity<?> getTableById(@PathVariable Long id) {
        try {
            RestaurantTableDTO table = restaurantService.getTableById(id);
            return ResponseEntity.ok(table);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/reservations")
    public ResponseEntity<?> createReservation(
            @Valid @RequestBody TableReservationCreateDTO createDTO,
            Authentication authentication) {
        try {
            Long userId = null;
            if (authentication != null) {
                String username = authentication.getName();
                User user = userService.findByUsername(username);
                userId = user.getId();
            }
            
            TableReservationDTO reservation = restaurantService.createReservation(createDTO, userId);
            return ResponseEntity.ok(reservation);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/reservations/my-reservations")
    public ResponseEntity<?> getMyReservations(Authentication authentication) {
        try {
            String username = authentication.getName();
            User user = userService.findByUsername(username);
            
            List<TableReservationDTO> reservations = restaurantService.getUserReservations(user.getId());
            return ResponseEntity.ok(reservations);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/reservations/{id}")
    public ResponseEntity<?> getReservationById(@PathVariable Long id) {
        try {
            TableReservationDTO reservation = restaurantService.getReservationById(id);
            return ResponseEntity.ok(reservation);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/reservations/{id}/cancel")
    public ResponseEntity<?> cancelReservation(
            @PathVariable Long id,
            Authentication authentication) {
        try {
            Long userId = null;
            if (authentication != null) {
                String username = authentication.getName();
                User user = userService.findByUsername(username);
                userId = user.getId();
            }
            
            restaurantService.cancelReservation(id, userId);
            return ResponseEntity.ok().body("Đã hủy đặt bàn thành công");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/reservations/by-date")
    public ResponseEntity<?> getReservationsByDate(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        try {
            List<TableReservationDTO> reservations = restaurantService.getReservationsByDate(date);
            return ResponseEntity.ok(reservations);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
