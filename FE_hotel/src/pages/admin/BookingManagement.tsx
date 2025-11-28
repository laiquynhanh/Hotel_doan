import { useState, useEffect } from 'react';
import { adminService, type AdminBookingDTO } from '../../services/admin.service';
import type { BookingStatus } from '../../types/booking.types';

// Admin view uses BookingDTO, which differs from BookingDetail (user view)
// BookingDTO has `id` and `userName`; BookingDetail has `bookingId` and `username`
// Previous implementation mistakenly used BookingDetail causing undefined IDs.
const BookingManagement = () => {
  const [bookings, setBookings] = useState<AdminBookingDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadBookings();
  }, []);

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

  if (loading) {
    return <div className="text-center py-5"><div className="spinner-border"></div></div>;
  }

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  return (
    <div className="bookings-tab">
      <h2>Quản Lý Đặt Phòng</h2>
      
      {/* Search Bar */}
      <div className="mb-3 mt-4">
        <div className="input-group">
          <span className="input-group-text">
            <i className="fa fa-search"></i>
          </span>
          <input
            type="text"
            className="form-control"
            placeholder="Tìm kiếm theo ID, số phòng, tên khách hàng, trạng thái..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

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
            {bookings
              .filter((booking) => {
                if (!searchQuery) return true;
                const query = searchQuery.toLowerCase();
                return (
                  booking.id.toString().includes(query) ||
                  booking.roomNumber.toLowerCase().includes(query) ||
                  booking.userName.toLowerCase().includes(query) ||
                  booking.status.toLowerCase().includes(query) ||
                  booking.checkInDate.includes(searchQuery) ||
                  booking.checkOutDate.includes(searchQuery)
                );
              })
              .map((booking) => (
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
  );
};

export default BookingManagement;
