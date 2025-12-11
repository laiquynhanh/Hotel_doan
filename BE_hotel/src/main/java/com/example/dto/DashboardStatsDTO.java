// DTO thống kê dashboard (doanh thu, đặt phòng, hàng tống, đánh giá)
package com.example.dto;

public class DashboardStatsDTO {
    private Long totalUsers;
    private Long totalRooms;
    private Long totalBookings;
    private Long pendingBookings;
    private Long confirmedBookings;
    private Long checkedInBookings;
    private Long availableRooms;
    private Long occupiedRooms;
    private Double totalRevenue;
    private Double monthlyRevenue;
    
    public DashboardStatsDTO() {}
    
    public DashboardStatsDTO(Long totalUsers, Long totalRooms, Long totalBookings, 
                            Long pendingBookings, Long confirmedBookings, Long checkedInBookings,
                            Long availableRooms, Long occupiedRooms, 
                            Double totalRevenue, Double monthlyRevenue) {
        this.totalUsers = totalUsers;
        this.totalRooms = totalRooms;
        this.totalBookings = totalBookings;
        this.pendingBookings = pendingBookings;
        this.confirmedBookings = confirmedBookings;
        this.checkedInBookings = checkedInBookings;
        this.availableRooms = availableRooms;
        this.occupiedRooms = occupiedRooms;
        this.totalRevenue = totalRevenue;
        this.monthlyRevenue = monthlyRevenue;
    }

    // Getters and Setters
    public Long getTotalUsers() { return totalUsers; }
    public void setTotalUsers(Long totalUsers) { this.totalUsers = totalUsers; }
    
    public Long getTotalRooms() { return totalRooms; }
    public void setTotalRooms(Long totalRooms) { this.totalRooms = totalRooms; }
    
    public Long getTotalBookings() { return totalBookings; }
    public void setTotalBookings(Long totalBookings) { this.totalBookings = totalBookings; }
    
    public Long getPendingBookings() { return pendingBookings; }
    public void setPendingBookings(Long pendingBookings) { this.pendingBookings = pendingBookings; }
    
    public Long getConfirmedBookings() { return confirmedBookings; }
    public void setConfirmedBookings(Long confirmedBookings) { this.confirmedBookings = confirmedBookings; }
    
    public Long getCheckedInBookings() { return checkedInBookings; }
    public void setCheckedInBookings(Long checkedInBookings) { this.checkedInBookings = checkedInBookings; }
    
    public Long getAvailableRooms() { return availableRooms; }
    public void setAvailableRooms(Long availableRooms) { this.availableRooms = availableRooms; }
    
    public Long getOccupiedRooms() { return occupiedRooms; }
    public void setOccupiedRooms(Long occupiedRooms) { this.occupiedRooms = occupiedRooms; }
    
    public Double getTotalRevenue() { return totalRevenue; }
    public void setTotalRevenue(Double totalRevenue) { this.totalRevenue = totalRevenue; }
    
    public Double getMonthlyRevenue() { return monthlyRevenue; }
    public void setMonthlyRevenue(Double monthlyRevenue) { this.monthlyRevenue = monthlyRevenue; }
}
