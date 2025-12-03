import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { bookingService } from '../services/booking.service';
import { paymentService } from '../services/payment.service';
import { foodService } from '../services/food.service';
import { restaurantService } from '../services/restaurant.service';
import type { BookingDetail } from '../types/booking.types';
import { BookingStatus } from '../types/booking.types';
import type { FoodOrder } from '../types/food.types';
import type { TableReservation } from '../types/restaurant.types';
import { useAuth } from '../context/AuthContext';
import { formatPrice } from '../utils/currency';
import '../styles/MyBookingsPage.css';

const MyBookingsPage = () => {
  const [bookings, setBookings] = useState<BookingDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [paymentLoadingId, setPaymentLoadingId] = useState<number | null>(null);
  const [selectedDepositPercentByBooking, setSelectedDepositPercentByBooking] = useState<Record<number, number>>({});
  const [foodOrders, setFoodOrders] = useState<FoodOrder[]>([]);
  const [reservations, setReservations] = useState<TableReservation[]>([]);
  const [expandedBookings, setExpandedBookings] = useState<Set<number>>(new Set());
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Chỉ redirect khi đã load xong auth state và chưa đăng nhập
    if (!isAuthenticated && !loading) {
      navigate('/login');
      return;
    }
    if (isAuthenticated) {
      fetchMyBookings();
    }
  }, [isAuthenticated, navigate]);

  const fetchMyBookings = async () => {
    try {
      setLoading(true);
      const data = await bookingService.getMyBookings();
      setBookings(data);
      setError('');
      // Load dịch vụ kèm theo
      await fetchAdditionalServices();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Không thể tải danh sách đặt phòng');
      console.error('Error fetching bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAdditionalServices = async () => {
    try {
      const [orders, reservs] = await Promise.all([
        foodService.getMyOrders().catch(() => []),
        restaurantService.getMyReservations().catch(() => [])
      ]);
      setFoodOrders(orders);
      setReservations(reservs);
    } catch (err) {
      console.error('Error fetching additional services:', err);
    }
  };

  const toggleExpandBooking = (bookingId: number) => {
    setExpandedBookings(prev => {
      const newSet = new Set(prev);
      if (newSet.has(bookingId)) {
        newSet.delete(bookingId);
      } else {
        newSet.add(bookingId);
      }
      return newSet;
    });
  };

  const getBookingServices = (bookingId: number) => {
    const orders = foodOrders.filter(o => o.roomNumber && bookings.find(b => b.bookingId === bookingId && b.roomNumber === o.roomNumber));
    const reservs = reservations.filter(r => {
      // Match by date range or other criteria
      const booking = bookings.find(b => b.bookingId === bookingId);
      if (!booking) return false;
      const reservDate = new Date(r.reservationDate);
      const checkIn = new Date(booking.checkInDate);
      const checkOut = new Date(booking.checkOutDate);
      return reservDate >= checkIn && reservDate <= checkOut;
    });
    return { orders, reservs };
  };

  const handleCancelBooking = async (bookingId: number) => {
    if (!window.confirm('Bạn có chắc chắn muốn hủy đặt phòng này?')) {
      return;
    }

    try {
      await bookingService.cancelBooking(bookingId);
      alert('Đã hủy đặt phòng thành công!');
      fetchMyBookings();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Không thể hủy đặt phòng');
      console.error('Error canceling booking:', err);
    }
  };

  const getStatusBadge = (status: BookingStatus) => {
    const statusMap = {
      [BookingStatus.PENDING]: { text: 'Chờ xác nhận', class: 'badge-warning' },
      [BookingStatus.CONFIRMED]: { text: 'Đã xác nhận', class: 'badge-success' },
      [BookingStatus.CHECKED_IN]: { text: 'Đã nhận phòng', class: 'badge-info' },
      [BookingStatus.CHECKED_OUT]: { text: 'Đã trả phòng', class: 'badge-secondary' },
      [BookingStatus.CANCELLED]: { text: 'Đã hủy', class: 'badge-danger' }
    };
    const { text, class: badgeClass } = statusMap[status];
    return <span className={`badge ${badgeClass}`}>{text}</span>;
  };

  const canCancel = (status: BookingStatus) => {
    return status === BookingStatus.PENDING || status === BookingStatus.CONFIRMED;
  };

  const calculateNights = (checkIn: string, checkOut: string) => {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diff = end.getTime() - start.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  if (loading) {
    return (
      <div className="container" style={{ marginTop: '100px', marginBottom: '100px' }}>
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Đang tải...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container my-bookings-page">
      <div className="row">
        <div className="col-lg-12">
          <div className="page-header">
            <h2>Đặt phòng của tôi</h2>
            <p className="text-muted">Quản lý tất cả các đặt phòng của bạn</p>
          </div>

          {error && (
            <div className="alert alert-danger">
              <i className="fa fa-exclamation-circle"></i> {error}
            </div>
          )}

          {bookings.length === 0 ? (
            <div className="alert alert-info">
              <i className="fa fa-info-circle"></i> Bạn chưa có đặt phòng nào. 
              <a href="/search-rooms" className="alert-link ms-2">Tìm phòng ngay</a>
            </div>
          ) : (
            <div className="bookings-list">
              {bookings.map((booking) => (
                <div key={booking.bookingId} className="booking-card">
                  <div className="booking-header">
                    <div className="booking-id">
                      <span className="label">Mã đặt phòng:</span>
                      <span className="value">#{booking.bookingId}</span>
                    </div>
                    <div className="booking-status">
                      {getStatusBadge(booking.status)}
                    </div>
                  </div>

                  <div className="booking-body">
                    <div className="row">
                      <div className="col-md-3">
                        <div className="booking-room-info">
                          <div className="room-image">
                            <img 
                              src={booking.imageUrl || '/img/room/room-default.jpg'} 
                              alt={`Phòng ${booking.roomNumber}`}
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/img/room/room-default.jpg';
                              }}
                            />
                          </div>
                          <div className="room-details">
                                <h5>Phòng {booking.roomNumber}</h5>
                                <p className="room-type">{booking.roomType}</p>
                                <div className="room-price">
                                  <div className="price-info">
                                    {formatPrice(booking.pricePerNight)} / đêm
                                  </div>
                                </div>
                          </div>
                        </div>
                      </div>

                      <div className="col-md-5">
                        <div className="booking-details">
                          <div className="detail-row">
                            <i className="fa fa-calendar"></i>
                            <div>
                              <strong>Nhận phòng:</strong> {booking.checkInDate}
                            </div>
                          </div>
                          <div className="detail-row">
                            <i className="fa fa-calendar"></i>
                            <div>
                              <strong>Trả phòng:</strong> {booking.checkOutDate}
                            </div>
                          </div>
                          <div className="detail-row">
                            <i className="fa fa-moon-o"></i>
                            <div>
                              <strong>Số đêm:</strong> {calculateNights(booking.checkInDate, booking.checkOutDate)} đêm
                            </div>
                          </div>
                          <div className="detail-row">
                            <i className="fa fa-users"></i>
                            <div>
                              <strong>Số khách:</strong> {booking.numberOfGuests} người
                            </div>
                          </div>
                          {booking.specialRequests && (
                            <div className="detail-row">
                              <i className="fa fa-comment-o"></i>
                              <div>
                                <strong>Yêu cầu đặc biệt:</strong> {booking.specialRequests}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="col-md-4">
                        <div className="booking-user-info">
                          <h6>Thông tin liên hệ</h6>
                          <div className="user-detail">
                            <i className="fa fa-user"></i>
                            <span>{booking.fullName}</span>
                          </div>
                          <div className="user-detail">
                            <i className="fa fa-envelope"></i>
                            <span>{booking.email}</span>
                          </div>
                          {booking.phoneNumber && (
                            <div className="user-detail">
                              <i className="fa fa-phone"></i>
                              <span>{booking.phoneNumber}</span>
                            </div>
                          )}
                          <div className="user-detail">
                            <i className="fa fa-clock-o"></i>
                            <span>Đặt lúc: {new Date(booking.createdAt).toLocaleString('vi-VN')}</span>
                          </div>
                        </div>

                        <div className="booking-total">
                          <div className="total-label">Tổng tiền:</div>
                          <div className="total-amount">
                            {formatPrice(booking.totalPrice)}
                          </div>
                        </div>

                        <div className="booking-actions">
                          {canCancel(booking.status) && (
                            <button 
                              className="btn-cancel"
                              onClick={() => handleCancelBooking(booking.bookingId)}
                              disabled={paymentLoadingId === booking.bookingId}
                            >
                              <i className="fa fa-times"></i> Hủy đặt phòng
                            </button>
                          )}

                          {/* Hiện nút thanh toán VNPAY cho trạng thái Chờ (PENDING) và tổng tiền > 0 */}
                          {booking.status === BookingStatus.PENDING && booking.totalPrice > 0 && (
                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                              <select
                                value={selectedDepositPercentByBooking[booking.bookingId] ?? 30}
                                onChange={(e) => setSelectedDepositPercentByBooking(prev => ({ ...prev, [booking.bookingId]: parseInt(e.target.value) }))}
                                style={{ padding: '8px 10px', borderRadius: 6, border: '1px solid #ddd' }}
                              >
                                {[20,30,40,50].map(p => (
                                  <option key={p} value={p}>{p}%</option>
                                ))}
                              </select>

                              <button
                                className="btn-pay-vnpay"
                                onClick={async () => {
                                  try {
                                    setPaymentLoadingId(booking.bookingId);
                                    const percent = selectedDepositPercentByBooking[booking.bookingId] ?? 30;
                                    // TÍNH TIỀN ĐẶT CỌC (tiếng Việt):
                                    // - deposit = làm tròn(booking.totalPrice * percent/100)
                                    // - deposit được gửi lên backend ở dạng VND nguyên.
                                    // - Backend sẽ nhân với 100 khi tạo tham số `vnp_Amount` để gọi VNPay.
                                    const deposit = Math.round((booking.totalPrice || 0) * (percent / 100));
                                    // Debug
                                    // eslint-disable-next-line no-console
                                    console.debug('[MyBookingsPage] creating payment for booking', booking.bookingId, 'percent=', percent, 'amount=', deposit);
                                    const resp = await paymentService.createPayment(booking.bookingId, deposit);
                                    // eslint-disable-next-line no-console
                                    console.debug('[MyBookingsPage] createPayment resp:', resp);
                                    if (resp && resp.paymentUrl) {
                                      window.location.href = resp.paymentUrl;
                                    } else {
                                      alert('Không thể tạo đường dẫn thanh toán. Vui lòng thử lại.');
                                    }
                                  } catch (err: any) {
                                    // eslint-disable-next-line no-console
                                    console.error('createPayment error', err);
                                    alert(err?.response?.data || 'Lỗi khi tạo thanh toán.');
                                  } finally {
                                    setPaymentLoadingId(null);
                                  }
                                }}
                                disabled={paymentLoadingId === booking.bookingId}
                              >
                                {paymentLoadingId === booking.bookingId ? 'Đang chuyển...' : 'Thanh toán cọc bằng VNPAY'}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Dịch vụ kèm theo */}
                  <div className="booking-services">
                    <button 
                      className="services-toggle"
                      onClick={() => toggleExpandBooking(booking.bookingId)}
                    >
                      <i className={`fa fa-${expandedBookings.has(booking.bookingId) ? 'minus' : 'plus'}-circle`}></i>
                      Dịch vụ kèm theo
                      {(() => {
                        const { orders, reservs } = getBookingServices(booking.bookingId);
                        const count = orders.length + reservs.length;
                        return count > 0 ? ` (${count})` : '';
                      })()}
                    </button>

                    {expandedBookings.has(booking.bookingId) && (
                      <div className="services-content">
                        {(() => {
                          const { orders, reservs } = getBookingServices(booking.bookingId);
                          
                          if (orders.length === 0 && reservs.length === 0) {
                            return (
                              <div className="no-services">
                                <i className="fa fa-info-circle"></i>
                                <span>Chưa có dịch vụ kèm theo nào</span>
                              </div>
                            );
                          }

                          return (
                            <>
                              {/* Food Orders */}
                              {orders.length > 0 && (
                                <div className="service-section">
                                  <h6><i className="fa fa-cutlery"></i> Đơn Room Service ({orders.length})</h6>
                                  <div className="service-items">
                                    {orders.map(order => (
                                      <div key={order.id} className="service-item">
                                        <div className="service-header">
                                          <span className="service-id">Đơn #{order.id}</span>
                                          <span className={`badge badge-${
                                            order.status === 'PENDING' ? 'warning' :
                                            order.status === 'PREPARING' ? 'info' :
                                            order.status === 'DELIVERING' ? 'primary' :
                                            order.status === 'DELIVERED' ? 'success' :
                                            'secondary'
                                          }`}>
                                            {order.status === 'PENDING' ? 'Chờ xử lý' :
                                             order.status === 'PREPARING' ? 'Đang chuẩn bị' :
                                             order.status === 'DELIVERING' ? 'Đang giao' :
                                             order.status === 'DELIVERED' ? 'Đã giao' :
                                             order.status === 'CANCELLED' ? 'Đã hủy' : order.status}
                                          </span>
                                        </div>
                                        <div className="service-details">
                                          <div><strong>Phòng:</strong> {order.roomNumber || 'N/A'}</div>
                                          <div><strong>Tổng tiền:</strong> {formatPrice(order.totalPrice)}</div>
                                          <div><strong>Số món:</strong> {order.items.length} món</div>
                                          {order.specialInstructions && (
                                            <div><strong>Ghi chú:</strong> {order.specialInstructions}</div>
                                          )}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Restaurant Reservations */}
                              {reservs.length > 0 && (
                                <div className="service-section">
                                  <h6><i className="fa fa-calendar-check-o"></i> Đặt bàn nhà hàng ({reservs.length})</h6>
                                  <div className="service-items">
                                    {reservs.map(reservation => (
                                      <div key={reservation.id} className="service-item">
                                        <div className="service-header">
                                          <span className="service-id">Đặt bàn #{reservation.id}</span>
                                          <span className={`badge badge-${
                                            reservation.status === 'PENDING' ? 'warning' :
                                            reservation.status === 'CONFIRMED' ? 'success' :
                                            reservation.status === 'COMPLETED' ? 'info' :
                                            'secondary'
                                          }`}>
                                            {reservation.status === 'PENDING' ? 'Chờ xác nhận' :
                                             reservation.status === 'CONFIRMED' ? 'Đã xác nhận' :
                                             reservation.status === 'COMPLETED' ? 'Hoàn thành' :
                                             reservation.status === 'CANCELLED' ? 'Đã hủy' : reservation.status}
                                          </span>
                                        </div>
                                        <div className="service-details">
                                          <div><strong>Bàn:</strong> {reservation.tableNumber}</div>
                                          <div><strong>Ngày:</strong> {reservation.reservationDate}</div>
                                          <div><strong>Giờ:</strong> {reservation.reservationTime}</div>
                                          <div><strong>Số khách:</strong> {reservation.partySize} người</div>
                                          {reservation.specialRequests && (
                                            <div><strong>Yêu cầu:</strong> {reservation.specialRequests}</div>
                                          )}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </>
                          );
                        })()}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyBookingsPage;
