import { useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import authService from '../../services/auth.service';
import '../../styles/AdminPage.css';

const AdminLayout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    if (!authService.isAdmin()) {
      alert('Bạn không có quyền truy cập trang này!');
      navigate('/');
    }
  }, [navigate]);

  const handleLogout = () => {
    if (window.confirm('Bạn có chắc chắn muốn đăng xuất?')) {
      authService.logout();
      navigate('/login');
    }
  };

  return (
    <div className="admin-page">
      <div className="container-fluid">
        <div className="row">
          {/* Sidebar */}
          <div className="col-md-2 admin-sidebar">
            <div className="sidebar-header">
              <h4>Admin Panel</h4>
            </div>
            <nav className="sidebar-nav">
              <NavLink 
                to="/admin/dashboard" 
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              >
                <i className="fa fa-dashboard"></i>
                <span>Dashboard</span>
              </NavLink>
              <NavLink 
                to="/admin/users" 
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              >
                <i className="fa fa-users"></i>
                <span>Người Dùng</span>
              </NavLink>
              <NavLink 
                to="/admin/rooms" 
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              >
                <i className="fa fa-bed"></i>
                <span>Phòng</span>
              </NavLink>
              <NavLink 
                to="/admin/bookings" 
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              >
                <i className="fa fa-calendar-check"></i>
                <span>Đặt Phòng</span>
              </NavLink>
              
              {/* Food & Beverage Section */}
              <div className="sidebar-divider">
                <span>Dịch Vụ Ăn Uống</span>
              </div>
              <NavLink 
                to="/admin/food-menu" 
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              >
                <i className="fa fa-cutlery"></i>
                <span>Thực Đơn</span>
              </NavLink>
              <NavLink 
                to="/admin/food-orders" 
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              >
                <i className="fa fa-shopping-cart"></i>
                <span>Đơn Hàng</span>
              </NavLink>
              <NavLink 
                to="/admin/restaurant-tables" 
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              >
                <i className="fa fa-table"></i>
                <span>Bàn Ăn</span>
              </NavLink>
              <NavLink 
                to="/admin/table-reservations" 
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              >
                <i className="fa fa-calendar"></i>
                <span>Đặt Bàn</span>
              </NavLink>
              
              <div className="nav-divider"></div>
              
              <NavLink 
                to="/admin/coupons" 
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              >
                <i className="fa fa-ticket"></i>
                <span>Mã Giảm Giá</span>
              </NavLink>
              <NavLink 
                to="/admin/reviews" 
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              >
                <i className="fa fa-star"></i>
                <span>Đánh Giá</span>
              </NavLink>
              
              <button className="nav-item" onClick={handleLogout}>
                <i className="fa fa-sign-out"></i>
                <span>Đăng Xuất</span>
              </button>
            </nav>
          </div>

          {/* Main Content */}
          <div className="col-md-10 admin-content">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
