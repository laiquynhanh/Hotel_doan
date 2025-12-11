package com.example.controllers;

import java.time.LocalDate;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
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

import com.example.domain.ReservationStatus;
import com.example.domain.RestaurantTable;
import com.example.dto.RestaurantTableDTO;
import com.example.dto.TableReservationDTO;
import com.example.services.RestaurantService;

@RestController
@RequestMapping("/api/admin/restaurant")
public class AdminRestaurantController {

    @Autowired
    private RestaurantService restaurantService;

    // Tables Management - ADMIN only
    @GetMapping("/tables")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAllTables() {
        try {
            List<RestaurantTableDTO> tables = restaurantService.getAllTables();
            return ResponseEntity.ok(tables);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/tables")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createTable(@RequestBody RestaurantTable table) {
        try {
            RestaurantTableDTO created = restaurantService.createTable(table);
            return ResponseEntity.ok(created);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/tables/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateTable(
            @PathVariable Long id,
            @RequestBody RestaurantTable table) {
        try {
            RestaurantTableDTO updated = restaurantService.updateTable(id, table);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/tables/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteTable(@PathVariable Long id) {
        try {
            restaurantService.deleteTable(id);
            return ResponseEntity.ok().body("Đã xóa bàn thành công");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Reservations Management - Both ADMIN and STAFF
    @GetMapping("/reservations")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<?> getAllReservations(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        try {
            List<TableReservationDTO> reservations;
            
            if (status != null) {
                ReservationStatus reservationStatus = ReservationStatus.valueOf(status.toUpperCase());
                reservations = restaurantService.getReservationsByStatus(reservationStatus);
            } else if (date != null) {
                reservations = restaurantService.getReservationsByDate(date);
            } else {
                reservations = restaurantService.getAllReservations();
            }
            
            return ResponseEntity.ok(reservations);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Trạng thái không hợp lệ");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/reservations/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<?> getReservationById(@PathVariable Long id) {
        try {
            TableReservationDTO reservation = restaurantService.getReservationById(id);
            return ResponseEntity.ok(reservation);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/reservations/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<?> updateReservationStatus(
            @PathVariable Long id,
            @RequestParam String status) {
        try {
            ReservationStatus reservationStatus = ReservationStatus.valueOf(status.toUpperCase());
            TableReservationDTO updated = restaurantService.updateReservationStatus(id, reservationStatus);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Trạng thái không hợp lệ");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/reservations/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> cancelReservation(@PathVariable Long id) {
        try {
            restaurantService.cancelReservation(id, null);
            return ResponseEntity.ok().body("Đã hủy đặt bàn thành công");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
