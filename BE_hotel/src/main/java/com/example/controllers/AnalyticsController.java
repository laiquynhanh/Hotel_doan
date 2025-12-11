package com.example.controllers;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.services.AnalyticsService;

/**
 * Controller xử lý các API thống kê và báo cáo
 * Cung cấp các endpoint để lấy dữ liệu analytics cho admin dashboard
 */
@RestController
@RequestMapping("/api/admin/analytics")
public class AnalyticsController {

    private static final String ERROR_KEY = "error";

    @Autowired
    private AnalyticsService analyticsService;

    @GetMapping("/overview")
    public ResponseEntity<Map<String, Object>> getOverview(
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        try {
            LocalDate start = startDate != null ? LocalDate.parse(startDate) : LocalDate.now().minusDays(30);
            LocalDate end = endDate != null ? LocalDate.parse(endDate) : LocalDate.now();
            
            Map<String, Object> overview = new HashMap<>();
            overview.put("totalRevenue", analyticsService.getTotalRevenue(start, end));
            overview.put("totalBookings", analyticsService.getTotalBookings(start, end));
            overview.put("totalGuests", analyticsService.getTotalGuests(start, end));
            overview.put("occupancyRate", analyticsService.getOccupancyRate(start, end));
            overview.put("averageBookingValue", analyticsService.getAverageBookingValue(start, end));
            
            return ResponseEntity.ok(overview);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(ERROR_KEY, e.getMessage()));
        }
    }

    @GetMapping("/popular-rooms")
    public ResponseEntity<?> getPopularRooms(
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            @RequestParam(defaultValue = "5") int limit) {
        try {
            LocalDate start = startDate != null ? LocalDate.parse(startDate) : LocalDate.now().minusDays(30);
            LocalDate end = endDate != null ? LocalDate.parse(endDate) : LocalDate.now();
            
            return ResponseEntity.ok(analyticsService.getPopularRooms(start, end, limit));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(ERROR_KEY, e.getMessage()));
        }
    }

    @GetMapping("/revenue-by-month")
    public ResponseEntity<?> getRevenueByMonth(@RequestParam(defaultValue = "2025") int year) {
        try {
            return ResponseEntity.ok(analyticsService.getRevenueByMonth(year));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(ERROR_KEY, e.getMessage()));
        }
    }

    @GetMapping("/bookings-by-status")
    public ResponseEntity<?> getBookingsByStatus(
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        try {
            LocalDate start = startDate != null ? LocalDate.parse(startDate) : LocalDate.now().minusDays(90);
            LocalDate end = endDate != null ? LocalDate.parse(endDate) : LocalDate.now();
            
            return ResponseEntity.ok(analyticsService.getBookingsByStatus(start, end));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(ERROR_KEY, e.getMessage()));
        }
    }

    @GetMapping("/coupon-usage")
    public ResponseEntity<?> getCouponUsage(
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        try {
            LocalDate start = startDate != null ? LocalDate.parse(startDate) : LocalDate.now().minusDays(90);
            LocalDate end = endDate != null ? LocalDate.parse(endDate) : LocalDate.now();
            
            return ResponseEntity.ok(analyticsService.getCouponUsageStats(start, end));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(ERROR_KEY, e.getMessage()));
        }
    }

    @GetMapping("/recent-bookings")
    public ResponseEntity<?> getRecentBookings(@RequestParam(defaultValue = "10") int limit) {
        try {
            return ResponseEntity.ok(analyticsService.getRecentBookings(limit));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(ERROR_KEY, e.getMessage()));
        }
    }

    @GetMapping("/revenue-breakdown")
    public ResponseEntity<?> getRevenueBreakdown(
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        try {
            LocalDate start = startDate != null ? LocalDate.parse(startDate) : LocalDate.now().minusDays(30);
            LocalDate end = endDate != null ? LocalDate.parse(endDate) : LocalDate.now();
            
            return ResponseEntity.ok(analyticsService.getRevenueBreakdown(start, end));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(ERROR_KEY, e.getMessage()));
        }
    }

    @GetMapping("/food-revenue")
    public ResponseEntity<?> getFoodRevenue(
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        try {
            LocalDate start = startDate != null ? LocalDate.parse(startDate) : LocalDate.now().minusDays(30);
            LocalDate end = endDate != null ? LocalDate.parse(endDate) : LocalDate.now();
            
            Map<String, Object> response = new HashMap<>();
            response.put("foodRevenue", analyticsService.getFoodOrderRevenue(start, end));
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(ERROR_KEY, e.getMessage()));
        }
    }

    @GetMapping("/additional-services-revenue")
    public ResponseEntity<?> getAdditionalServicesRevenue(
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        try {
            LocalDate start = startDate != null ? LocalDate.parse(startDate) : LocalDate.now().minusDays(30);
            LocalDate end = endDate != null ? LocalDate.parse(endDate) : LocalDate.now();
            
            Map<String, Object> response = new HashMap<>();
            response.put("additionalServicesRevenue", analyticsService.getAdditionalServicesRevenue(start, end));
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(ERROR_KEY, e.getMessage()));
        }
    }
}