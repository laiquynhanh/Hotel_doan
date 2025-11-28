import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/auth.service';
import { adminService } from '../services/admin.service';
import type { DashboardStats, UserDTO, AdminBookingDTO } from '../services/admin.service';
import { roomService } from '../services/room.service';
import type { Room, RoomType, RoomStatus } from '../types/room.types';
import type { BookingStatus } from '../types/booking.types';
import '../styles/AdminPage.css';

const AdminPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'rooms' | 'bookings'>('dashboard');
  
  // Dashboard
  const [stats, setStats] = useState<DashboardStats | null>(null);
  
  // Users
  const [users, setUsers] = useState<UserDTO[]>([]);
  
  // Rooms
  const [rooms, setRooms] = useState<Room[]>([]);
  const [categories, setCategories] = useState<Array<{ id: number; name: string }>>([]);
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [roomFormData, setRoomFormData] = useState<Partial<Room>>({
    roomNumber: '',
    roomType: 'STANDARD' as RoomType,
    pricePerNight: 0,
    capacity: 1,
    size: 0,
    description: '',
    amenities: '',
    status: 'AVAILABLE' as RoomStatus,
    imageUrl: ''
  });
  
  // Bookings
  const [bookings, setBookings] = useState<AdminBookingDTO[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authService.isAdmin()) {
      alert('Bạn không có quyền truy cập trang này!');
      navigate('/');
      return;
    }
    loadDashboard();
  }, [navigate]);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const data = await adminService.getDashboardStats();
      setStats(data);
      setError('');
    } catch (err: any) {
      setError('Không thể tải thống kê');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await adminService.getAllUsers();
      setUsers(data);
      setError('');
    } catch (err: any) {
      setError('Không thể tải danh sách người dùng');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadRooms = async () => {
    try {
      setLoading(true);
      const data = await adminService.getAllRooms();
      setRooms(data);
      setError('');
    } catch (err: any) {
      setError('Không thể tải danh sách phòng');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await (await import('../services/category.service')).categoryService.getAll();
      setCategories(data.map(c => ({ id: c.id, name: c.name })));
    } catch (err: any) {
      console.error('Không thể tải categories', err);
    } finally {
      setLoading(false);
    }
  };

  const loadBookings = async () => {
    try {
      setLoading(true);
      const data = await adminService.getAllBookings();
      setBookings(data);
      setError('');
    } catch (err: any) {
      setError('Không thể tải danh sách đặt phòng');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tab: 'dashboard' | 'users' | 'rooms' | 'bookings') => {
    setActiveTab(tab);
    if (tab === 'dashboard') loadDashboard();
    else if (tab === 'users') loadUsers();
    else if (tab === 'rooms') {
      loadRooms();
      loadCategories();
    }
    else if (tab === 'bookings') loadBookings();
  };

  const handleDeleteUser = async (id: number) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa người dùng này?')) return;
    try {
      await adminService.deleteUser(id);
      alert('Đã xóa người dùng thành công!');
      loadUsers();
    } catch (err: any) {
      alert('Không thể xóa người dùng');
    }
  };

  // Room CRUD handlers
  const handleOpenCreateRoom = () => {
    setEditingRoom(null);
    setRoomFormData({
      roomNumber: '',
      roomType: 'STANDARD' as RoomType,
      pricePerNight: 0,
      capacity: 1,
      size: 0,
      description: '',
      amenities: '',
      status: 'AVAILABLE' as RoomStatus,
      imageUrl: ''
    });
    // load categories for modal select
    loadCategories();
    setShowRoomModal(true);
  };

  const handleOpenEditRoom = (room: Room) => {
    setEditingRoom(room);
    setRoomFormData({
      roomNumber: room.roomNumber,
      roomType: room.roomType,
      pricePerNight: room.pricePerNight,
      capacity: room.capacity,
      size: room.size,
      description: room.description,
      amenities: room.amenities,
      status: room.status,
      imageUrl: room.imageUrl,
      category: room.category ? { id: room.category.id, name: room.category.name } : undefined
    });
    // load categories and preselect if room has category
    loadCategories();
    setShowRoomModal(true);
  };

  const handleCloseRoomModal = () => {
    setShowRoomModal(false);
    setEditingRoom(null);
  };

  const handleRoomFormChange = (field: keyof Room, value: any) => {
    setRoomFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveRoom = async () => {
    try {
      if (editingRoom) {
        // Update existing room
        await roomService.updateRoom(editingRoom.id, roomFormData);
        alert('Đã cập nhật phòng thành công!');
      } else {
        // Create new room
        await roomService.createRoom(roomFormData);
        alert('Đã tạo phòng mới thành công!');
      }
      handleCloseRoomModal();
      loadRooms();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Không thể lưu phòng');
    }
  };

  const handleDeleteRoom = async (id: number) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa phòng này?')) return;
    try {
      await roomService.deleteRoom(id);
      alert('Đã xóa phòng thành công!');
      loadRooms();
    } catch (err: any) {
      alert('Không thể xóa phòng');
    }
  };

  const handleUpdateBookingStatus = async (id: number, status: BookingStatus) => {
    try {
      await adminService.updateBookingStatus(id, status);
      alert('Đã cập nhật trạng thái thành công!');
      loadBookings();
    } catch (err: any) {
      alert('Không thể cập nhật trạng thái');
    }
  };

  const handleDeleteBooking = async (id: number) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa đặt phòng này?')) return;
    try {
      await adminService.deleteBooking(id);
      alert('Đã xóa đặt phòng thành công!');
      loadBookings();
    } catch (err: any) {
      alert('Không thể xóa đặt phòng');
    }
  };

  return (
    <div className="admin-page">
      <div className="container-fluid">
        <div className="row">
          {/* Sidebar */}
          <div className="col-md-2 admin-sidebar">
            <div className="sidebar-header">
              <h4>Quản Trị</h4>
            </div>
            <nav className="sidebar-nav">
              <button 
                className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
                onClick={() => handleTabChange('dashboard')}
              >
                <i className="fa fa-dashboard"></i> Dashboard
              </button>
              <button 
                className={`nav-item ${activeTab === 'users' ? 'active' : ''}`}
                onClick={() => handleTabChange('users')}
              >
                <i className="fa fa-users"></i> Quản lý Users
              </button>
              <button 
                className={`nav-item ${activeTab === 'rooms' ? 'active' : ''}`}
                onClick={() => handleTabChange('rooms')}
              >
                <i className="fa fa-bed"></i> Quản lý Phòng
              </button>
              <button 
                className={`nav-item ${activeTab === 'bookings' ? 'active' : ''}`}
                onClick={() => handleTabChange('bookings')}
              >
                <i className="fa fa-calendar"></i> Quản lý Đặt Phòng
              </button>
            </nav>
          </div>

          {/* Main Content */}
          <div className="col-md-10 admin-content">
            {error && (
              <div className="alert alert-danger">{error}</div>
            )}

            {loading && (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Đang tải...</span>
                </div>
              </div>
            )}

            {/* Dashboard Tab */}
            {activeTab === 'dashboard' && stats && !loading && (
              <div className="dashboard-tab">
                <h2>Dashboard - Thống Kê Tổng Quan</h2>
                
                <div className="row mt-4">
                  <div className="col-md-3">
                    <div className="stat-card stat-primary">
                      <div className="stat-icon">
                        <i className="fa fa-users"></i>
                      </div>
                      <div className="stat-info">
                        <h3>{stats.totalUsers}</h3>
                        <p>Tổng Users</p>
                      </div>
                    </div>
                  </div>

                  <div className="col-md-3">
                    <div className="stat-card stat-success">
                      <div className="stat-icon">
                        <i className="fa fa-bed"></i>
                      </div>
                      <div className="stat-info">
                        <h3>{stats.totalRooms}</h3>
                        <p>Tổng Phòng</p>
                      </div>
                    </div>
                  </div>

                  <div className="col-md-3">
                    <div className="stat-card stat-warning">
                      <div className="stat-icon">
                        <i className="fa fa-calendar"></i>
                      </div>
                      <div className="stat-info">
                        <h3>{stats.totalBookings}</h3>
                        <p>Tổng Đặt Phòng</p>
                      </div>
                    </div>
                  </div>

                  <div className="col-md-3">
                    <div className="stat-card stat-info">
                      <div className="stat-icon">
                        <i className="fa fa-money"></i>
                      </div>
                      <div className="stat-info">
                        <h3>{stats.totalRevenue.toLocaleString('vi-VN')} VNĐ</h3>
                        <p>Tổng Doanh Thu</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="row mt-4">
                  <div className="col-md-6">
                    <div className="info-card">
                      <h5>Trạng Thái Đặt Phòng</h5>
                      <div className="info-item">
                        <span>Chờ xác nhận:</span>
                        <span className="badge bg-warning">{stats.pendingBookings}</span>
                      </div>
                      <div className="info-item">
                        <span>Đã xác nhận:</span>
                        <span className="badge bg-success">{stats.confirmedBookings}</span>
                      </div>
                      <div className="info-item">
                        <span>Đã nhận phòng:</span>
                        <span className="badge bg-info">{stats.checkedInBookings}</span>
                      </div>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="info-card">
                      <h5>Trạng Thái Phòng</h5>
                      <div className="info-item">
                        <span>Phòng trống:</span>
                        <span className="badge bg-success">{stats.availableRooms}</span>
                      </div>
                      <div className="info-item">
                        <span>Phòng đã đặt:</span>
                        <span className="badge bg-danger">{stats.occupiedRooms}</span>
                      </div>
                      <div className="info-item">
                        <span>Doanh thu tháng này:</span>
                        <span className="text-primary fw-bold">{stats.monthlyRevenue.toLocaleString('vi-VN')} VNĐ</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Users Tab */}
            {activeTab === 'users' && !loading && (
              <div className="users-tab">
                <h2>Quản Lý Người Dùng</h2>
                <div className="table-responsive mt-4">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Username</th>
                        <th>Họ Tên</th>
                        <th>Email</th>
                        <th>Số ĐT</th>
                        <th>Quyền</th>
                        <th>Hành động</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr key={user.id}>
                          <td>{user.id}</td>
                          <td>{user.username}</td>
                          <td>{user.fullName}</td>
                          <td>{user.email}</td>
                          <td>{user.phoneNumber || '-'}</td>
                          <td>
                            <span className={`badge ${
                              user.role === 'ADMIN' ? 'bg-danger' : 
                              user.role === 'STAFF' ? 'bg-warning' : 'bg-secondary'
                            }`}>
                              {user.role}
                            </span>
                          </td>
                          <td>
                            {user.role !== 'ADMIN' && (
                              <button 
                                className="btn btn-sm btn-danger"
                                onClick={() => handleDeleteUser(user.id)}
                              >
                                <i className="fa fa-trash"></i>
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Rooms Tab */}
            {activeTab === 'rooms' && !loading && (
              <div className="rooms-tab">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h2>Quản Lý Phòng</h2>
                  <button className="btn btn-primary" onClick={handleOpenCreateRoom}>
                    <i className="fa fa-plus me-2"></i>Thêm Phòng Mới
                  </button>
                </div>
                <div className="table-responsive mt-4">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Số Phòng</th>
                        <th>Loại</th>
                        <th>Giá/Đêm</th>
                        <th>Sức Chứa</th>
                        <th>Diện Tích</th>
                        <th>Trạng Thái</th>
                        <th>Thao Tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rooms.map((room) => (
                        <tr key={room.id}>
                          <td>{room.id}</td>
                          <td>{room.roomNumber}</td>
                          <td>{room.roomType}</td>
                          <td>{room.pricePerNight.toLocaleString('vi-VN')} VNĐ</td>
                          <td>{room.capacity} người</td>
                          <td>{room.size}m²</td>
                          <td>
                            <span className={`badge ${
                              room.status === 'AVAILABLE' ? 'bg-success' : 
                              room.status === 'OCCUPIED' ? 'bg-danger' : 'bg-warning'
                            }`}>
                              {room.status}
                            </span>
                          </td>
                          <td>
                            <button 
                              className="btn btn-sm btn-warning me-2"
                              onClick={() => handleOpenEditRoom(room)}
                            >
                              <i className="fa fa-edit"></i> Sửa
                            </button>
                            <button 
                              className="btn btn-sm btn-danger"
                              onClick={() => handleDeleteRoom(room.id)}
                            >
                              <i className="fa fa-trash"></i> Xóa
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Bookings Tab */}
            {activeTab === 'bookings' && !loading && (
              <div className="bookings-tab">
                <h2>Quản Lý Đặt Phòng</h2>
                <div className="table-responsive mt-4">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Phòng</th>
                        <th>Khách Hàng</th>
                        <th>Ngày Nhận</th>
                        <th>Ngày Trả</th>
                        <th>Số Khách</th>
                        <th>Tổng Tiền</th>
                        <th>Trạng Thái</th>
                        <th>Hành Động</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookings.map((booking) => (
                        <tr key={booking.id}>
                          <td>{booking.id}</td>
                          <td>Phòng {booking.roomNumber}</td>
                          <td>{booking.userName}</td>
                          <td>{booking.checkInDate}</td>
                          <td>{booking.checkOutDate}</td>
                          <td>{booking.numberOfGuests}</td>
                          <td>{booking.totalPrice.toLocaleString('vi-VN')} VNĐ</td>
                          <td>
                            <select 
                              className="form-select form-select-sm"
                              value={booking.status}
                              onChange={(e) => handleUpdateBookingStatus(booking.id, e.target.value as BookingStatus)}
                            >
                              <option value="PENDING">Chờ xác nhận</option>
                              <option value="CONFIRMED">Đã xác nhận</option>
                              <option value="CHECKED_IN">Đã nhận phòng</option>
                              <option value="CHECKED_OUT">Đã trả phòng</option>
                              <option value="CANCELLED">Đã hủy</option>
                            </select>
                          </td>
                          <td>
                            <button 
                              className="btn btn-sm btn-danger"
                              onClick={() => handleDeleteBooking(booking.id)}
                            >
                              <i className="fa fa-trash"></i>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Room Modal */}
      {showRoomModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editingRoom ? 'Chỉnh Sửa Phòng' : 'Thêm Phòng Mới'}
                </h5>
                <button type="button" className="btn-close" onClick={handleCloseRoomModal}></button>
              </div>
              <div className="modal-body">
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label">Số Phòng *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={roomFormData.roomNumber || ''}
                      onChange={(e) => handleRoomFormChange('roomNumber', e.target.value)}
                      placeholder="VD: 101"
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Loại Phòng *</label>
                    <select
                      className="form-control"
                      value={roomFormData.roomType || 'STANDARD'}
                      onChange={(e) => handleRoomFormChange('roomType', e.target.value as RoomType)}
                    >
                      <option value="SINGLE">Đơn</option>
                      <option value="DOUBLE">Đôi</option>
                      <option value="DELUXE">Cao Cấp</option>
                      <option value="SUITE">Suite</option>
                      <option value="FAMILY">Gia Đình</option>
                      <option value="PREMIUM">Premium</option>
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Category</label>
                    <select
                      className="form-control"
                      value={roomFormData.category?.id ?? ''}
                      onChange={(e) => {
                        const id = e.target.value ? Number(e.target.value) : undefined;
                        handleRoomFormChange('category', id ? { id } : undefined);
                      }}
                    >
                      <option value="">Không</option>
                      {categories.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Giá/Đêm (VNĐ) *</label>
                    <input
                      type="number"
                      className="form-control"
                      value={roomFormData.pricePerNight || 0}
                      onChange={(e) => handleRoomFormChange('pricePerNight', Number(e.target.value))}
                      min="0"
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Sức Chứa (người) *</label>
                    <input
                      type="number"
                      className="form-control"
                      value={roomFormData.capacity || 1}
                      onChange={(e) => handleRoomFormChange('capacity', Number(e.target.value))}
                      min="1"
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Diện Tích (m²) *</label>
                    <input
                      type="number"
                      className="form-control"
                      value={roomFormData.size || 0}
                      onChange={(e) => handleRoomFormChange('size', Number(e.target.value))}
                      min="0"
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Trạng Thái *</label>
                    <select
                      className="form-control"
                      value={roomFormData.status || 'AVAILABLE'}
                      onChange={(e) => handleRoomFormChange('status', e.target.value as RoomStatus)}
                    >
                      <option value="AVAILABLE">Có Sẵn</option>
                      <option value="OCCUPIED">Đang Sử Dụng</option>
                      <option value="MAINTENANCE">Bảo Trì</option>
                      <option value="CLEANING">Dọn Dẹp</option>
                    </select>
                  </div>
                  <div className="col-12">
                    <label className="form-label">Mô Tả</label>
                    <textarea
                      className="form-control"
                      rows={3}
                      value={roomFormData.description || ''}
                      onChange={(e) => handleRoomFormChange('description', e.target.value)}
                      placeholder="Mô tả chi tiết về phòng..."
                    ></textarea>
                  </div>
                  <div className="col-12">
                    <label className="form-label">Tiện Nghi</label>
                    <input
                      type="text"
                      className="form-control"
                      value={roomFormData.amenities || ''}
                      onChange={(e) => handleRoomFormChange('amenities', e.target.value)}
                      placeholder="VD: WiFi, TV, Máy lạnh, Tủ lạnh..."
                    />
                  </div>
                  <div className="col-12">
                    <label className="form-label">Hình Ảnh Phòng</label>
                    
                    {/* Preview hình ảnh */}
                    {roomFormData.imageUrl && (
                      <div className="image-preview mb-3">
                        <img 
                          src={roomFormData.imageUrl} 
                          alt="Preview" 
                          style={{ maxWidth: '200px', maxHeight: '150px', objectFit: 'cover', borderRadius: '8px' }}
                        />
                      </div>
                    )}
                    
                    {/* Chọn từ thư viện ảnh có sẵn */}
                    <div className="mb-2">
                      <label className="form-label small text-muted">Chọn từ thư viện:</label>
                      <div className="row g-2">
                        {[
                          '/img/room/room-1.jpg',
                          '/img/room/room-2.jpg',
                          '/img/room/room-3.jpg',
                          '/img/room/room-4.jpg',
                          '/img/room/room-b1.jpg',
                          '/img/room/room-b2.jpg',
                          '/img/room/room-b3.jpg',
                          '/img/room/room-b4.jpg'
                        ].map((url) => (
                          <div key={url} className="col-3">
                            <img
                              src={url}
                              alt="Room"
                              onClick={() => handleRoomFormChange('imageUrl', url)}
                              style={{
                                width: '100%',
                                height: '80px',
                                objectFit: 'cover',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                border: roomFormData.imageUrl === url ? '3px solid #dfa974' : '1px solid #ddd',
                                transition: 'all 0.2s'
                              }}
                              onMouseOver={(e) => {
                                if (roomFormData.imageUrl !== url) {
                                  e.currentTarget.style.border = '2px solid #dfa974';
                                }
                              }}
                              onMouseOut={(e) => {
                                if (roomFormData.imageUrl !== url) {
                                  e.currentTarget.style.border = '1px solid #ddd';
                                }
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Hoặc nhập URL tùy chỉnh */}
                    <div>
                      <label className="form-label small text-muted">Hoặc nhập URL:</label>
                      <input
                        type="text"
                        className="form-control"
                        value={roomFormData.imageUrl || ''}
                        onChange={(e) => handleRoomFormChange('imageUrl', e.target.value)}
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={handleCloseRoomModal}>
                  Hủy
                </button>
                <button type="button" className="btn btn-primary" onClick={handleSaveRoom}>
                  {editingRoom ? 'Cập Nhật' : 'Tạo Mới'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;
