import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { adminService } from '../../services/admin.service';
import '../../styles/admin/Analytics.css';

interface OverviewData {
  totalRevenue: number;
  totalBookings: number;
  totalGuests: number;
  occupancyRate: number;
  averageBookingValue: number;
}

interface PopularRoom {
  roomId: number;
  roomNumber: string;
  roomType: string;
  bookingCount: number;
}

interface MonthRevenue {
  month: number;
  monthName: string;
  revenue: number;
}

interface CouponStats {
  totalCouponUsage: number;
  totalDiscount: number;
  usageByCode: Record<string, number>;
}

interface RevenueBreakdown {
  roomRevenue: number;
  foodRevenue: number;
  additionalServicesRevenue: number;
  totalRevenue: number;
  roomPercentage: number;
  foodPercentage: number;
  additionalServicesPercentage: number;
}

const Analytics = () => {
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [popularRooms, setPopularRooms] = useState<PopularRoom[]>([]);
  const [revenueByMonth, setRevenueByMonth] = useState<MonthRevenue[]>([]);
  const [bookingsByStatus, setBookingsByStatus] = useState<Record<string, number>>({});
  const [couponStats, setCouponStats] = useState<CouponStats | null>(null);
  const [revenueBreakdown, setRevenueBreakdown] = useState<RevenueBreakdown | null>(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const currentYear = new Date().getFullYear();
  const startYear = 2024; // earliest year to show; extend if needed
  const yearOptions = Array.from({ length: currentYear - startYear + 1 }, (_, i) => currentYear - i);

  useEffect(() => {
    loadAnalytics();
  }, [selectedYear]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      
      const [overviewRes, roomsRes, revenueRes, statusRes, couponRes, breakdownRes] = await Promise.all([
        adminService.getAnalyticsOverview(),
        adminService.getPopularRooms(),
        adminService.getRevenueByMonth(selectedYear),
        adminService.getBookingsByStatus(),
        adminService.getCouponUsage(),
        adminService.getRevenueBreakdown()
      ]);

      setOverview(overviewRes);
      setPopularRooms(roomsRes);
      setRevenueBreakdown(breakdownRes);

      // Normalize monthly revenue to ensure 12 months with zeros when missing
      const normalized = Array.from({ length: 12 }, (_, idx) => {
        const monthNum = idx + 1;
        const found = (revenueRes || []).find((m: any) => m.month === monthNum);
        return {
          month: monthNum,
          monthName: `T${monthNum}`,
          revenue: found?.revenue ?? 0,
        } as MonthRevenue;
      });
      setRevenueByMonth(normalized);
      setBookingsByStatus(statusRes);
      setCouponStats(couponRes);
    } catch (err) {
      console.error('Error loading analytics:', err);
      toast.error('Không thể tải dữ liệu thống kê');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const getMaxRevenue = () => {
    if (!revenueByMonth.length) return 0;
    return Math.max(...revenueByMonth.map(m => m.revenue));
  };

  if (loading) {
    return (
      <div className="analytics-loading">
        <div className="spinner-border text-primary"></div>
        <p>Đang tải dữ liệu...</p>
      </div>
    );
  }

  return (
    <div className="analytics-container">
      <div className="analytics-header">
        <h2>📊 Thống Kê & Phân Tích</h2>
        <div className="year-selector">
          <label htmlFor="year-select">Năm:</label>
          <select id="year-select" value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))}>
            {yearOptions.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
      </div>

      {/* KPI Cards */}
      {overview && (
        <div className="kpi-grid">
          <div className="kpi-card revenue">
            <div className="kpi-content">
              <h3>Tổng Doanh Thu</h3>
              <p className="kpi-value">{formatCurrency(overview.totalRevenue)}</p>
              <span className="kpi-label">30 ngày gần đây</span>
            </div>
          </div>

          <div className="kpi-card bookings">
            <div className="kpi-content">
              <h3>Tổng Đặt Phòng</h3>
              <p className="kpi-value">{overview.totalBookings}</p>
              <span className="kpi-label">30 ngày gần đây</span>
            </div>
          </div>

          <div className="kpi-card guests">
            <div className="kpi-content">
              <h3>Tổng Khách</h3>
              <p className="kpi-value">{overview.totalGuests}</p>
              <span className="kpi-label">30 ngày gần đây</span>
            </div>
          </div>

          <div className="kpi-card average">
            <div className="kpi-content">
              <h3>Giá Trị TB/Booking</h3>
              <p className="kpi-value">{formatCurrency(overview.averageBookingValue)}</p>
              <span className="kpi-label">30 ngày gần đây</span>
            </div>
          </div>
        </div>
      )}

      {/* Revenue Breakdown */}
      {revenueBreakdown && (
        <div className="revenue-breakdown-grid">
          <div className="revenue-breakdown-card room-revenue">
            <h4>💰 Doanh Thu Phòng</h4>
            <p className="revenue-amount">{formatCurrency(revenueBreakdown.roomRevenue)}</p>
            <div className="revenue-percentage">{revenueBreakdown.roomPercentage?.toFixed(1)}%</div>
          </div>

          <div className="revenue-breakdown-card food-revenue">
            <h4>🍽️ Doanh Thu Đồ Ăn</h4>
            <p className="revenue-amount">{formatCurrency(revenueBreakdown.foodRevenue)}</p>
            <div className="revenue-percentage">{revenueBreakdown.foodPercentage?.toFixed(1)}%</div>
          </div>

          <div className="revenue-breakdown-card service-revenue">
            <h4>🎯 Doanh Thu Dịch Vụ</h4>
            <p className="revenue-amount">{formatCurrency(revenueBreakdown.additionalServicesRevenue)}</p>
            <div className="revenue-percentage">{revenueBreakdown.additionalServicesPercentage?.toFixed(1)}%</div>
          </div>
        </div>
      )}

      {/* Charts Section */}
      <div className="charts-grid">
        {/* Revenue Chart */}
        <div className="chart-card">
          <h3>Doanh Thu Theo Tháng ({selectedYear})</h3>
          <div className="bar-chart">
            {revenueByMonth.map(month => {
              const maxRevenue = getMaxRevenue();
              const heightPercent = maxRevenue > 0 ? (month.revenue / maxRevenue) * 100 : 0;
              return (
                <div key={month.month} className="bar-item">
                  <div className="bar-wrapper">
                    <div 
                      className="bar" 
                      style={{ height: `${heightPercent}%` }}
                      title={formatCurrency(month.revenue)}
                    >
                      <span className="bar-value">{month.revenue === 0 ? '0đ' : `${(month.revenue / 1_000_000).toFixed(1)}M`}</span>
                    </div>
                  </div>
                  <div className="bar-label">T{month.month}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Popular Rooms */}
        <div className="chart-card">
          <h3>Top Phòng Phổ Biến</h3>
          <div className="popular-rooms-list">
            {popularRooms.map((room, index) => (
              <div key={room.roomId} className="popular-room-item">
                <span className="room-rank">#{index + 1}</span>
                <div className="room-info">
                  <strong>{room.roomNumber}</strong>
                  <span className="room-type">{room.roomType}</span>
                </div>
                <span className="booking-count">{room.bookingCount} bookings</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bookings by Status */}
        <div className="chart-card">
          <h3>Booking Theo Trạng Thái</h3>
          <div className="status-list">
            {Object.entries(bookingsByStatus).map(([status, count]) => (
              <div key={status} className="status-item">
                <div className="status-info">
                  <span className={`status-badge ${status.toLowerCase()}`}>{status}</span>
                  <span className="status-count">{count}</span>
                </div>
                <div className="status-bar-bg">
                  <div 
                    className={`status-bar ${status.toLowerCase()}`}
                    style={{ 
                      width: `${Math.max(count / Math.max(...Object.values(bookingsByStatus)) * 100, 5)}%` 
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Coupon Usage */}
        {couponStats && (
          <div className="chart-card">
            <h3>Thống Kê Coupon</h3>
            <div className="coupon-stats">
              <div className="coupon-summary">
                <div className="coupon-stat">
                  <span className="label">Tổng lượt dùng:</span>
                  <span className="value">{couponStats.totalCouponUsage}</span>
                </div>
                <div className="coupon-stat">
                  <span className="label">Tổng giảm giá:</span>
                  <span className="value">{formatCurrency(couponStats.totalDiscount)}</span>
                </div>
              </div>
              <div className="coupon-codes">
                <h4>Sử dụng theo mã:</h4>
                {Object.entries(couponStats.usageByCode).map(([code, count]) => (
                  <div key={code} className="coupon-code-item">
                    <span className="code">{code}</span>
                    <span className="count">{count} lần</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Analytics;
