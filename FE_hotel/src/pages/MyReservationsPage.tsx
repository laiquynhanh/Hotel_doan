import { useState, useEffect } from 'react';
import { restaurantService } from '../services/restaurant.service';
import type { TableReservation, ReservationStatus } from '../types/restaurant.types';
import '../styles/MyReservationsPage.css';

const MyReservationsPage = () => {
  const [reservations, setReservations] = useState<TableReservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<number | null>(null);

  useEffect(() => {
    loadReservations();
  }, []);

  const loadReservations = async () => {
    try {
      setLoading(true);
      const data = await restaurantService.getMyReservations();
      setReservations(data);
    } catch (error) {
      console.error('Error loading reservations:', error);
      alert('Không thể tải danh sách đặt bàn');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelReservation = async (reservationId: number) => {
    if (!window.confirm('Bạn có chắc muốn hủy đặt bàn này?')) {
      return;
    }

    try {
      setCancellingId(reservationId);
      await restaurantService.cancelReservation(reservationId);
      alert('Đã hủy đặt bàn thành công');
      loadReservations();
    } catch (error: any) {
      console.error('Error cancelling reservation:', error);
      alert(error.response?.data || 'Không thể hủy đặt bàn');
    } finally {
      setCancellingId(null);
    }
  };

  const getStatusBadgeClass = (status: ReservationStatus): string => {
    switch (status) {
      case 'PENDING':
        return 'bg-warning';
      case 'CONFIRMED':
        return 'bg-success';
      case 'SEATED':
        return 'bg-info';
      case 'COMPLETED':
        return 'bg-secondary';
      case 'CANCELLED':
        return 'bg-danger';
      case 'NO_SHOW':
        return 'bg-dark';
      default:
        return 'bg-secondary';
    }
  };

  const getStatusText = (status: ReservationStatus): string => {
    const statusMap: Record<ReservationStatus, string> = {
      PENDING: 'Chờ xác nhận',
      CONFIRMED: 'Đã xác nhận',
      SEATED: 'Đã nhận bàn',
      COMPLETED: 'Hoàn thành',
      CANCELLED: 'Đã hủy',
      NO_SHOW: 'Không đến'
    };
    return statusMap[status] || status;
  };

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="container text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="my-reservations-page">
      <div className="container my-5">
        <h2 className="text-center mb-4">Đặt Bàn Của Tôi</h2>

        {reservations.length === 0 ? (
          <div className="text-center py-5">
            <i className="fa fa-calendar-o fa-3x text-muted mb-3"></i>
            <p className="text-muted">Bạn chưa có đặt bàn nào</p>
            <a href="/restaurant-booking" className="btn btn-primary">Đặt Bàn Ngay</a>
          </div>
        ) : (
          <div className="reservations-list">
            {reservations.map(reservation => (
              <div key={reservation.id} className="reservation-card card mb-3">
                <div className="card-header d-flex justify-content-between align-items-center">
                  <div>
                    <strong>Đặt bàn #{reservation.id}</strong>
                    <small className="text-muted ms-3">
                      {new Date(reservation.createdAt).toLocaleString('vi-VN')}
                    </small>
                  </div>
                  <span className={`badge ${getStatusBadgeClass(reservation.status)}`}>
                    {getStatusText(reservation.status)}
                  </span>
                </div>
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-8">
                      <div className="reservation-info">
                        <div className="info-row">
                          <i className="fa fa-table me-2 text-primary"></i>
                          <strong>Bàn:</strong> {reservation.tableNumber || `#${reservation.tableId}`}
                        </div>
                        <div className="info-row">
                          <i className="fa fa-calendar me-2 text-primary"></i>
                          <strong>Ngày:</strong> {formatDate(reservation.reservationDate)}
                        </div>
                        <div className="info-row">
                          <i className="fa fa-clock-o me-2 text-primary"></i>
                          <strong>Giờ:</strong> {reservation.reservationTime}
                        </div>
                        <div className="info-row">
                          <i className="fa fa-users me-2 text-primary"></i>
                          <strong>Số người:</strong> {reservation.partySize}
                        </div>
                      </div>

                      <div className="guest-info mt-3">
                        <h6>Thông tin khách:</h6>
                        <div><strong>Họ tên:</strong> {reservation.guestName}</div>
                        <div><strong>Điện thoại:</strong> {reservation.guestPhone}</div>
                        {reservation.guestEmail && (
                          <div><strong>Email:</strong> {reservation.guestEmail}</div>
                        )}
                      </div>

                      {reservation.specialRequests && (
                        <div className="special-requests mt-3">
                          <strong>Yêu cầu đặc biệt:</strong>
                          <p className="text-muted mb-0">{reservation.specialRequests}</p>
                        </div>
                      )}
                    </div>

                    <div className="col-md-4 text-end">
                      {(reservation.status === 'PENDING' || reservation.status === 'CONFIRMED') && (
                        <button
                          className="btn btn-danger"
                          onClick={() => handleCancelReservation(reservation.id)}
                          disabled={cancellingId === reservation.id}
                        >
                          {cancellingId === reservation.id ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2"></span>
                              Đang hủy...
                            </>
                          ) : (
                            <>
                              <i className="fa fa-times me-2"></i>
                              Hủy Đặt Bàn
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyReservationsPage;
