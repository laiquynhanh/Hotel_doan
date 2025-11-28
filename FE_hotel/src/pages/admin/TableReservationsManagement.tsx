import { useState, useEffect } from 'react';
import { adminService } from '../../services/admin.service';
import type { TableReservation } from '../../types/restaurant.types';
import { ReservationStatus } from '../../types/restaurant.types';
import '../../styles/admin/TableReservationsManagement.css';

const TableReservationsManagement = () => {
  const [reservations, setReservations] = useState<TableReservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<ReservationStatus | 'ALL'>('ALL');
  const [selectedReservation, setSelectedReservation] = useState<TableReservation | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadReservations();
  }, []);

  const loadReservations = async () => {
    try {
      setLoading(true);
      const data = await adminService.getAllReservations();
      setReservations(data);
    } catch (error) {
      console.error('Error loading reservations:', error);
      alert('Không thể tải danh sách đặt bàn');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (reservationId: number, newStatus: ReservationStatus) => {
    if (!window.confirm(`Xác nhận cập nhật trạng thái đặt bàn #${reservationId}?`)) {
      return;
    }

    try {
      await adminService.updateReservationStatus(reservationId, newStatus);
      alert('Cập nhật trạng thái thành công');
      loadReservations();
      if (selectedReservation && selectedReservation.id === reservationId) {
        setShowModal(false);
        setSelectedReservation(null);
      }
    } catch (error: any) {
      console.error('Error updating reservation status:', error);
      alert(error.response?.data || 'Không thể cập nhật trạng thái');
    }
  };

  const handleViewDetails = (reservation: TableReservation) => {
    setSelectedReservation(reservation);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedReservation(null);
  };

  const getStatusBadgeClass = (status: ReservationStatus): string => {
    switch (status) {
      case ReservationStatus.PENDING: return 'bg-warning';
      case ReservationStatus.CONFIRMED: return 'bg-success';
      case ReservationStatus.SEATED: return 'bg-info';
      case ReservationStatus.COMPLETED: return 'bg-secondary';
      case ReservationStatus.CANCELLED: return 'bg-danger';
      case ReservationStatus.NO_SHOW: return 'bg-dark';
      default: return 'bg-secondary';
    }
  };

  const getStatusText = (status: ReservationStatus): string => {
    const statusMap: Record<ReservationStatus, string> = {
      [ReservationStatus.PENDING]: 'Chờ xác nhận',
      [ReservationStatus.CONFIRMED]: 'Đã xác nhận',
      [ReservationStatus.SEATED]: 'Đã nhận bàn',
      [ReservationStatus.COMPLETED]: 'Hoàn thành',
      [ReservationStatus.CANCELLED]: 'Đã hủy',
      [ReservationStatus.NO_SHOW]: 'Không đến'
    };
    return statusMap[status] || status;
  };

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('vi-VN');
  };

  const filteredReservations = filterStatus === 'ALL'
    ? reservations
    : reservations.filter(res => res.status === filterStatus);

  const statuses: Array<ReservationStatus | 'ALL'> = [
    'ALL',
    ReservationStatus.PENDING,
    ReservationStatus.CONFIRMED,
    ReservationStatus.SEATED,
    ReservationStatus.COMPLETED,
    ReservationStatus.CANCELLED,
    ReservationStatus.NO_SHOW
  ];

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="table-reservations-management">
      <h3 className="mb-4">Quản Lý Đặt Bàn</h3>

      {/* Status Filter */}
      <div className="status-filters mb-4">
        {statuses.map(status => (
          <button
            key={status}
            className={`btn ${filterStatus === status ? 'btn-primary' : 'btn-outline-primary'} me-2 mb-2`}
            onClick={() => setFilterStatus(status)}
          >
            {status === 'ALL' ? 'Tất cả' : getStatusText(status)}
          </button>
        ))}
      </div>

      {/* Reservations Table */}
      <div className="card">
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Mã ĐB</th>
                  <th>Bàn</th>
                  <th>Khách hàng</th>
                  <th>Điện thoại</th>
                  <th>Ngày/Giờ</th>
                  <th>Số người</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredReservations.map(reservation => (
                  <tr key={reservation.id}>
                    <td><strong>#{reservation.id}</strong></td>
                    <td>{reservation.tableNumber || `#${reservation.tableId}`}</td>
                    <td>{reservation.guestName}</td>
                    <td>{reservation.guestPhone}</td>
                    <td>
                      <small>
                        {formatDate(reservation.reservationDate)}<br />
                        {reservation.reservationTime}
                      </small>
                    </td>
                    <td>{reservation.partySize}</td>
                    <td>
                      <span className={`badge ${getStatusBadgeClass(reservation.status)}`}>
                        {getStatusText(reservation.status)}
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn btn-sm btn-info me-2"
                        onClick={() => handleViewDetails(reservation)}
                      >
                        <i className="fa fa-eye"></i> Chi tiết
                      </button>
                      {reservation.status !== ReservationStatus.COMPLETED &&
                       reservation.status !== ReservationStatus.CANCELLED &&
                       reservation.status !== ReservationStatus.NO_SHOW && (
                        <div className="btn-group">
                          <button
                            type="button"
                            className="btn btn-sm btn-success dropdown-toggle"
                            data-bs-toggle="dropdown"
                          >
                            Cập nhật
                          </button>
                          <ul className="dropdown-menu">
                            {reservation.status === ReservationStatus.PENDING && (
                              <>
                                <li>
                                  <button
                                    className="dropdown-item"
                                    onClick={() => handleUpdateStatus(reservation.id, ReservationStatus.CONFIRMED)}
                                  >
                                    ✓ Xác nhận
                                  </button>
                                </li>
                                <li>
                                  <button
                                    className="dropdown-item text-danger"
                                    onClick={() => handleUpdateStatus(reservation.id, ReservationStatus.CANCELLED)}
                                  >
                                    ✗ Hủy
                                  </button>
                                </li>
                              </>
                            )}
                            {reservation.status === ReservationStatus.CONFIRMED && (
                              <>
                                <li>
                                  <button
                                    className="dropdown-item"
                                    onClick={() => handleUpdateStatus(reservation.id, ReservationStatus.SEATED)}
                                  >
                                    🪑 Đã nhận bàn
                                  </button>
                                </li>
                                <li>
                                  <button
                                    className="dropdown-item text-warning"
                                    onClick={() => handleUpdateStatus(reservation.id, ReservationStatus.NO_SHOW)}
                                  >
                                    ⚠️ Không đến
                                  </button>
                                </li>
                              </>
                            )}
                            {reservation.status === ReservationStatus.SEATED && (
                              <li>
                                <button
                                  className="dropdown-item"
                                  onClick={() => handleUpdateStatus(reservation.id, ReservationStatus.COMPLETED)}
                                >
                                  ✅ Hoàn thành
                                </button>
                              </li>
                            )}
                          </ul>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredReservations.length === 0 && (
              <div className="text-center py-4 text-muted">
                Không có đặt bàn nào
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Reservation Details Modal */}
      {showModal && selectedReservation && (
        <div className="modal fade show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Chi tiết đặt bàn #{selectedReservation.id}</h5>
                <button type="button" className="btn-close" onClick={handleCloseModal}></button>
              </div>
              <div className="modal-body">
                <div className="row mb-3">
                  <div className="col-md-6">
                    <strong>Bàn:</strong> {selectedReservation.tableNumber || `#${selectedReservation.tableId}`}
                  </div>
                  <div className="col-md-6">
                    <strong>Trạng thái:</strong>{' '}
                    <span className={`badge ${getStatusBadgeClass(selectedReservation.status)}`}>
                      {getStatusText(selectedReservation.status)}
                    </span>
                  </div>
                </div>

                <div className="row mb-3">
                  <div className="col-md-6">
                    <strong>Ngày:</strong> {formatDate(selectedReservation.reservationDate)}
                  </div>
                  <div className="col-md-6">
                    <strong>Giờ:</strong> {selectedReservation.reservationTime}
                  </div>
                </div>

                <div className="row mb-3">
                  <div className="col-md-6">
                    <strong>Số người:</strong> {selectedReservation.partySize}
                  </div>
                  <div className="col-md-6">
                    <strong>Đặt lúc:</strong>{' '}
                    <small>{new Date(selectedReservation.createdAt).toLocaleString('vi-VN')}</small>
                  </div>
                </div>

                <hr />

                <h6>Thông tin khách:</h6>
                <div className="row mb-3">
                  <div className="col-md-6">
                    <strong>Họ tên:</strong> {selectedReservation.guestName}
                  </div>
                  <div className="col-md-6">
                    <strong>Điện thoại:</strong> {selectedReservation.guestPhone}
                  </div>
                </div>
                {selectedReservation.guestEmail && (
                  <div className="mb-3">
                    <strong>Email:</strong> {selectedReservation.guestEmail}
                  </div>
                )}

                {selectedReservation.specialRequests && (
                  <div className="mt-3">
                    <strong>Yêu cầu đặc biệt:</strong>
                    <p className="text-muted mb-0 mt-2">{selectedReservation.specialRequests}</p>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TableReservationsManagement;
