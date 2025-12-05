import { useState, useEffect } from 'react';
import { adminService } from '../../services/admin.service';
import type { DashboardStats } from '../../services/admin.service';

interface RevenueBreakdown {
  roomRevenue: number;
  foodRevenue: number;
  additionalServicesRevenue: number;
  totalRevenue: number;
  roomPercentage: number;
  foodPercentage: number;
  additionalServicesPercentage: number;
}

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [revenueBreakdown, setRevenueBreakdown] = useState<RevenueBreakdown | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const data = await adminService.getDashboardStats();
      setStats(data);
      
      // Load revenue breakdown
      const breakdown = await adminService.getRevenueBreakdown();
      setRevenueBreakdown(breakdown);
      
      setError('');
    } catch (err: any) {
      setError('Không thể tải thông tin dashboard');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number | undefined) => {
    if (!value) return '0 VNĐ';
    return value.toLocaleString('vi-VN') + ' VNĐ';
  };

  if (loading) {
    return <div className="text-center py-5"><div className="spinner-border"></div></div>;
  }

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  return (
    <div className="dashboard-tab">
      <h2>Tổng Quan Hệ Thống</h2>
      
      <div className="row mt-4">
        {/* Stat Cards */}
        <div className="col-md-3">
          <div className="stat-card stat-card-blue">
            <div className="stat-icon">
              <i className="fa fa-users"></i>
            </div>
            <div className="stat-info">
              <h3>{stats?.totalUsers || 0}</h3>
              <p>Người Dùng</p>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="stat-card stat-card-green">
            <div className="stat-icon">
              <i className="fa fa-bed"></i>
            </div>
            <div className="stat-info">
              <h3>{stats?.totalRooms || 0}</h3>
              <p>Tổng Phòng</p>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="stat-card stat-card-orange">
            <div className="stat-icon">
              <i className="fa fa-calendar-check"></i>
            </div>
            <div className="stat-info">
              <h3>{stats?.totalBookings || 0}</h3>
              <p>Đặt Phòng</p>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="stat-card stat-card-purple">
            <div className="stat-icon">
              <i className="fa fa-dollar-sign"></i>
            </div>
            <div className="stat-info">
              <h3>{stats?.totalRevenue?.toLocaleString('vi-VN') || 0} VNĐ</h3>
              <p>Tổng Doanh Thu</p>
            </div>
          </div>
        </div>
      </div>

      {/* Revenue Breakdown Cards */}
      <div className="row mt-4">
        <div className="col-md-4">
          <div className="info-card">
            <h5>
              <i className="fa fa-home me-2"></i>Doanh Thu Phòng
            </h5>
            <div className="revenue-value">
              {formatCurrency(revenueBreakdown?.roomRevenue)}
            </div>
            {revenueBreakdown?.roomPercentage && (
              <div className="revenue-percentage">
                {revenueBreakdown.roomPercentage.toFixed(1)}%
              </div>
            )}
            <div className="progress mt-2" style={{ height: '5px' }}>
              <div 
                className="progress-bar bg-success" 
                style={{ width: `${revenueBreakdown?.roomPercentage || 0}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="info-card">
            <h5>
              <i className="fa fa-cutlery me-2"></i>Doanh Thu Đồ Ăn
            </h5>
            <div className="revenue-value">
              {formatCurrency(revenueBreakdown?.foodRevenue)}
            </div>
            {revenueBreakdown?.foodPercentage && (
              <div className="revenue-percentage">
                {revenueBreakdown.foodPercentage.toFixed(1)}%
              </div>
            )}
            <div className="progress mt-2" style={{ height: '5px' }}>
              <div 
                className="progress-bar bg-info" 
                style={{ width: `${revenueBreakdown?.foodPercentage || 0}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="info-card">
            <h5>
              <i className="fa fa-concierge-bell me-2"></i>Doanh Thu Dịch Vụ
            </h5>
            <div className="revenue-value">
              {formatCurrency(revenueBreakdown?.additionalServicesRevenue)}
            </div>
            {revenueBreakdown?.additionalServicesPercentage && (
              <div className="revenue-percentage">
                {revenueBreakdown.additionalServicesPercentage.toFixed(1)}%
              </div>
            )}
            <div className="progress mt-2" style={{ height: '5px' }}>
              <div 
                className="progress-bar bg-warning" 
                style={{ width: `${revenueBreakdown?.additionalServicesPercentage || 0}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Info Cards */}
      <div className="row mt-4">
        <div className="col-md-6">
          <div className="info-card">
            <h4>Tình Trạng Đặt Phòng</h4>
            <div className="info-list">
              <div className="info-item">
                <span className="badge bg-warning">Chờ xác nhận</span>
                <span className="info-value">{stats?.pendingBookings || 0}</span>
              </div>
              <div className="info-item">
                <span className="badge bg-info">Đã xác nhận</span>
                <span className="info-value">{stats?.confirmedBookings || 0}</span>
              </div>
              <div className="info-item">
                <span className="badge bg-success">Đã nhận phòng</span>
                <span className="info-value">{stats?.checkedInBookings || 0}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="info-card">
            <h4>Tình Trạng Phòng</h4>
            <div className="info-list">
              <div className="info-item">
                <span className="badge bg-success">Còn trống</span>
                <span className="info-value">{stats?.availableRooms || 0}</span>
              </div>
              <div className="info-item">
                <span className="badge bg-danger">Đã đặt</span>
                <span className="info-value">{stats?.occupiedRooms || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .revenue-value {
          font-size: 1.5rem;
          font-weight: bold;
          color: #0d6efd;
          margin: 10px 0;
        }
        .revenue-percentage {
          font-size: 0.9rem;
          color: #6c757d;
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
