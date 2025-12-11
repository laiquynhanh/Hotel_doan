// ========================================
// DỊCH VỤ PHÂN TÍCH THỐNG KÊ (Analytics Service)
// ========================================
// Xử lý logic liên quan đến:
// - Tính toán doanh thu, lợi nhuận theo khoảng thời gian
// - Thống kê đặt phòng, hủy phòng
// - Phân tích dữ liệu phòng (tối đa, trung bình, rủi ro)
// - Báo cáo tổng hợp theo ngày, tháng, quý
// - Dữ liệu hỗ trợ dashboard admin

package com.example.services;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.domain.Booking;
import com.example.domain.BookingStatus;
import com.example.domain.FoodOrder;
import com.example.domain.FoodOrderStatus;
import com.example.repositories.BookingRepository;
import com.example.repositories.FoodOrderRepository;
import com.example.repositories.RoomRepository;

/**
 * Service xử lý logic thống kê và báo cáo
 * Chức năng chính:
 * - Tính tổng doanh thu theo khoảng thời gian
 * - Thống kê số lượng booking theo trạng thái
 * - Tính occupancy rate (tỷ lệ lấp đầy phòng)
 * - Thống kê phòng phổ biến nhất
 * - Thống kê sử dụng coupon
 */
@Service
public class AnalyticsService {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private RoomRepository roomRepository;

    @Autowired
    private FoodOrderRepository foodOrderRepository;

    public BigDecimal getTotalRevenue(LocalDate startDate, LocalDate endDate) {
        LocalDateTime start = startDate.atStartOfDay();
        LocalDateTime end = endDate.atTime(23, 59, 59);
        
        List<Booking> bookings = bookingRepository.findAll().stream()
                .filter(b -> b.getCreatedAt() != null 
                        && !b.getCreatedAt().isBefore(start) 
                        && !b.getCreatedAt().isAfter(end)
                        && (b.getStatus() == BookingStatus.CONFIRMED 
                            || b.getStatus() == BookingStatus.CHECKED_IN
                            || b.getStatus() == BookingStatus.CHECKED_OUT))
                .collect(Collectors.toList());
        
        return bookings.stream()
                .map(Booking::getTotalPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    public Long getTotalBookings(LocalDate startDate, LocalDate endDate) {
        LocalDateTime start = startDate.atStartOfDay();
        LocalDateTime end = endDate.atTime(23, 59, 59);
        
        return bookingRepository.findAll().stream()
                .filter(b -> b.getCreatedAt() != null 
                        && !b.getCreatedAt().isBefore(start) 
                        && !b.getCreatedAt().isAfter(end))
                .count();
    }

    public int getTotalGuests(LocalDate startDate, LocalDate endDate) {
        LocalDateTime start = startDate.atStartOfDay();
        LocalDateTime end = endDate.atTime(23, 59, 59);
        
        return bookingRepository.findAll().stream()
                .filter(b -> b.getCreatedAt() != null 
                        && !b.getCreatedAt().isBefore(start) 
                        && !b.getCreatedAt().isAfter(end)
                        && (b.getStatus() == BookingStatus.CONFIRMED 
                            || b.getStatus() == BookingStatus.CHECKED_IN
                            || b.getStatus() == BookingStatus.CHECKED_OUT))
                .mapToInt(Booking::getNumberOfGuests)
                .sum();
    }

    public double getOccupancyRate(LocalDate startDate, LocalDate endDate) {
        LocalDateTime start = startDate.atStartOfDay();
        LocalDateTime end = endDate.atTime(23, 59, 59);
        
        long totalRooms = roomRepository.count();
        long days = java.time.temporal.ChronoUnit.DAYS.between(startDate, endDate) + 1;
        long totalRoomNights = totalRooms * days;
        
        if (totalRoomNights == 0) return 0.0;
        
        long bookedNights = bookingRepository.findAll().stream()
                .filter(b -> b.getCreatedAt() != null 
                        && !b.getCreatedAt().isBefore(start) 
                        && !b.getCreatedAt().isAfter(end)
                        && (b.getStatus() == BookingStatus.CONFIRMED 
                            || b.getStatus() == BookingStatus.CHECKED_IN
                            || b.getStatus() == BookingStatus.CHECKED_OUT))
                .mapToLong(b -> {
                    LocalDate checkIn = b.getCheckInDate().isBefore(startDate) ? startDate : b.getCheckInDate();
                    LocalDate checkOut = b.getCheckOutDate().isAfter(endDate) ? endDate : b.getCheckOutDate();
                    return java.time.temporal.ChronoUnit.DAYS.between(checkIn, checkOut);
                })
                .sum();
        
        return (double) bookedNights / totalRoomNights * 100;
    }

    public double getAverageBookingValue(LocalDate startDate, LocalDate endDate) {
        LocalDateTime start = startDate.atStartOfDay();
        LocalDateTime end = endDate.atTime(23, 59, 59);
        
        List<Booking> bookings = bookingRepository.findAll().stream()
                .filter(b -> b.getCreatedAt() != null 
                        && !b.getCreatedAt().isBefore(start) 
                        && !b.getCreatedAt().isAfter(end)
                        && (b.getStatus() == BookingStatus.CONFIRMED 
                            || b.getStatus() == BookingStatus.CHECKED_IN
                            || b.getStatus() == BookingStatus.CHECKED_OUT))
                .collect(Collectors.toList());
        
        if (bookings.isEmpty()) return 0.0;
        
        BigDecimal total = bookings.stream()
                .map(Booking::getTotalPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        return total.divide(BigDecimal.valueOf(bookings.size()), 2, RoundingMode.HALF_UP).doubleValue();
    }

    public List<Map<String, Object>> getPopularRooms(LocalDate startDate, LocalDate endDate, int limit) {
        LocalDateTime start = startDate.atStartOfDay();
        LocalDateTime end = endDate.atTime(23, 59, 59);
        
        Map<Long, Long> roomBookingCount = bookingRepository.findAll().stream()
                .filter(b -> b.getCreatedAt() != null 
                        && !b.getCreatedAt().isBefore(start) 
                        && !b.getCreatedAt().isAfter(end)
                        && (b.getStatus() == BookingStatus.CONFIRMED 
                            || b.getStatus() == BookingStatus.CHECKED_IN
                            || b.getStatus() == BookingStatus.CHECKED_OUT))
                .collect(Collectors.groupingBy(
                        b -> b.getRoom().getId(),
                        Collectors.counting()
                ));
        
        return roomBookingCount.entrySet().stream()
                .sorted((e1, e2) -> Long.compare(e2.getValue(), e1.getValue()))
                .limit(limit)
                .map(entry -> {
                    Map<String, Object> result = new HashMap<>();
                    var room = roomRepository.findById(entry.getKey()).orElse(null);
                    if (room != null) {
                        result.put("roomId", room.getId());
                        result.put("roomNumber", room.getRoomNumber());
                        result.put("roomType", room.getRoomType().toString());
                        result.put("bookingCount", entry.getValue());
                    }
                    return result;
                })
                .filter(m -> !m.isEmpty())
                .collect(Collectors.toList());
    }

    public List<Map<String, Object>> getRevenueByMonth(int year) {
        List<Map<String, Object>> result = new ArrayList<>();
        
        for (int month = 1; month <= 12; month++) {
            LocalDate startDate = LocalDate.of(year, month, 1);
            LocalDate endDate = startDate.plusMonths(1).minusDays(1);
            
            BigDecimal revenue = getTotalRevenue(startDate, endDate);
            
            Map<String, Object> monthData = new HashMap<>();
            monthData.put("month", month);
            monthData.put("monthName", "T" + month);
            monthData.put("revenue", revenue);
            result.add(monthData);
        }
        
        return result;
    }

    public Map<String, Integer> getBookingsByStatus(LocalDate startDate, LocalDate endDate) {
        LocalDateTime start = startDate.atStartOfDay();
        LocalDateTime end = endDate.atTime(23, 59, 59);
        
        Map<String, Long> statusCounts = bookingRepository.findAll().stream()
                .filter(b -> b.getCreatedAt() != null 
                        && !b.getCreatedAt().isBefore(start) 
                        && !b.getCreatedAt().isAfter(end))
                .collect(Collectors.groupingBy(
                        b -> b.getStatus().toString(),
                        Collectors.counting()
                ));
        
        Map<String, Integer> result = new HashMap<>();
        statusCounts.forEach((status, count) -> result.put(status, count.intValue()));
        
        // Đảm bảo tất cả trạng thái đều hiển thị
        for (BookingStatus status : BookingStatus.values()) {
            result.putIfAbsent(status.toString(), 0);
        }
        
        return result;
    }

    public Map<String, Object> getCouponUsageStats(LocalDate startDate, LocalDate endDate) {
        LocalDateTime start = startDate.atStartOfDay();
        LocalDateTime end = endDate.atTime(23, 59, 59);
        
        List<Booking> bookingsWithCoupon = bookingRepository.findAll().stream()
                .filter(b -> b.getCreatedAt() != null 
                        && !b.getCreatedAt().isBefore(start) 
                        && !b.getCreatedAt().isAfter(end)
                        && b.getCouponCode() != null 
                        && !b.getCouponCode().isEmpty())
                .collect(Collectors.toList());
        
        BigDecimal totalDiscount = bookingsWithCoupon.stream()
                .map(Booking::getDiscountAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        Map<String, Long> couponUsageCount = bookingsWithCoupon.stream()
                .collect(Collectors.groupingBy(
                        Booking::getCouponCode,
                        Collectors.counting()
                ));
        
        Map<String, Object> result = new HashMap<>();
        result.put("totalCouponUsage", bookingsWithCoupon.size());
        result.put("totalDiscount", totalDiscount);
        result.put("usageByCode", couponUsageCount);
        
        return result;
    }

    public List<Map<String, Object>> getRecentBookings(int limit) {
        return bookingRepository.findAll().stream()
                .sorted((b1, b2) -> {
                    if (b1.getCreatedAt() == null) return 1;
                    if (b2.getCreatedAt() == null) return -1;
                    return b2.getCreatedAt().compareTo(b1.getCreatedAt());
                })
                .limit(limit)
                .map(b -> {
                    Map<String, Object> result = new HashMap<>();
                    result.put("id", b.getId());
                    result.put("userName", b.getUser().getUsername());
                    result.put("roomNumber", b.getRoom().getRoomNumber());
                    result.put("checkInDate", b.getCheckInDate());
                    result.put("checkOutDate", b.getCheckOutDate());
                    result.put("totalPrice", b.getTotalPrice());
                    result.put("status", b.getStatus().toString());
                    result.put("createdAt", b.getCreatedAt());
                    return result;
                })
                .collect(Collectors.toList());
    }

    // Food Order Revenue Methods
    public BigDecimal getFoodOrderRevenue(LocalDate startDate, LocalDate endDate) {
        LocalDateTime start = startDate.atStartOfDay();
        LocalDateTime end = endDate.atTime(23, 59, 59);
        
        List<FoodOrder> foodOrders = foodOrderRepository.findAll().stream()
                .filter(fo -> fo.getOrderTime() != null 
                        && !fo.getOrderTime().isBefore(start) 
                        && !fo.getOrderTime().isAfter(end)
                        && isFoodOrderCompleted(fo.getStatus()))
                .collect(Collectors.toList());
        
        return foodOrders.stream()
                .map(FoodOrder::getTotalPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private boolean isFoodOrderCompleted(FoodOrderStatus status) {
        return status == FoodOrderStatus.DELIVERED 
                || status == FoodOrderStatus.CONFIRMED
                || status == FoodOrderStatus.DELIVERING
                || status == FoodOrderStatus.PREPARING;
    }

    // Additional Services Revenue Methods
    public BigDecimal getAdditionalServicesRevenue(LocalDate startDate, LocalDate endDate) {
        LocalDateTime start = startDate.atStartOfDay();
        LocalDateTime end = endDate.atTime(23, 59, 59);
        
        List<Booking> bookings = bookingRepository.findAll().stream()
                .filter(b -> b.getCreatedAt() != null 
                        && !b.getCreatedAt().isBefore(start) 
                        && !b.getCreatedAt().isAfter(end)
                        && (b.getStatus() == BookingStatus.CONFIRMED 
                            || b.getStatus() == BookingStatus.CHECKED_IN
                            || b.getStatus() == BookingStatus.CHECKED_OUT)
                        && hasAdditionalServices(b))
                .collect(Collectors.toList());
        
        return bookings.stream()
                .map(this::calculateAdditionalServicesCost)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private boolean hasAdditionalServices(Booking booking) {
        return (booking.getAirportPickup() != null && booking.getAirportPickup())
                || (booking.getSpaService() != null && booking.getSpaService())
                || (booking.getLaundryService() != null && booking.getLaundryService())
                || (booking.getTourGuide() != null && booking.getTourGuide());
    }

    private BigDecimal calculateAdditionalServicesCost(Booking booking) {
        BigDecimal cost = BigDecimal.ZERO;
        if (booking.getAirportPickup()) {
            cost = cost.add(BigDecimal.valueOf(500000)); // 500k VND
        }
        if (booking.getSpaService()) {
            cost = cost.add(BigDecimal.valueOf(300000)); // 300k VND
        }
        if (booking.getLaundryService()) {
            cost = cost.add(BigDecimal.valueOf(100000)); // 100k VND
        }
        if (booking.getTourGuide()) {
            cost = cost.add(BigDecimal.valueOf(800000)); // 800k VND
        }
        return cost;
    }

    // Total Revenue including all sources
    public BigDecimal getTotalRevenueIncludingAll(LocalDate startDate, LocalDate endDate) {
        BigDecimal roomRevenue = getTotalRevenue(startDate, endDate);
        BigDecimal foodRevenue = getFoodOrderRevenue(startDate, endDate);
        BigDecimal additionalServicesRevenue = getAdditionalServicesRevenue(startDate, endDate);
        
        return roomRevenue.add(foodRevenue).add(additionalServicesRevenue);
    }

    // Revenue Breakdown for Analytics
    public Map<String, Object> getRevenueBreakdown(LocalDate startDate, LocalDate endDate) {
        BigDecimal roomRevenue = getTotalRevenue(startDate, endDate);
        BigDecimal foodRevenue = getFoodOrderRevenue(startDate, endDate);
        BigDecimal additionalServicesRevenue = getAdditionalServicesRevenue(startDate, endDate);
        BigDecimal totalRevenue = roomRevenue.add(foodRevenue).add(additionalServicesRevenue);
        
        Map<String, Object> result = new HashMap<>();
        result.put("roomRevenue", roomRevenue);
        result.put("foodRevenue", foodRevenue);
        result.put("additionalServicesRevenue", additionalServicesRevenue);
        result.put("totalRevenue", totalRevenue);
        
        // Calculate percentages
        if (totalRevenue.compareTo(BigDecimal.ZERO) > 0) {
            result.put("roomPercentage", roomRevenue.multiply(BigDecimal.valueOf(100))
                    .divide(totalRevenue, 2, RoundingMode.HALF_UP));
            result.put("foodPercentage", foodRevenue.multiply(BigDecimal.valueOf(100))
                    .divide(totalRevenue, 2, RoundingMode.HALF_UP));
            result.put("additionalServicesPercentage", additionalServicesRevenue.multiply(BigDecimal.valueOf(100))
                    .divide(totalRevenue, 2, RoundingMode.HALF_UP));
        }
        
        return result;
    }
}