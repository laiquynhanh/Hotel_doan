import { useState, useEffect } from 'react';
import { adminService } from '../../services/admin.service';
import type { DashboardStats } from '../../services/admin.service';

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
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
      setError('');
    } catch (err: any) {
      setError('Không thể tải thông tin dashboard');
      console.error(err);
    } finally {
      setLoading(false);
    }
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
    </div>
  );
};

export default Dashboard;
