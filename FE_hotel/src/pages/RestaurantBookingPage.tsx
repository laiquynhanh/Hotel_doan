import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { restaurantService } from '../services/restaurant.service';
import type { RestaurantTable, TableReservationCreate } from '../types/restaurant.types';
import '../styles/RestaurantBookingPage.css';

const RestaurantBookingPage = () => {
  const navigate = useNavigate();
  const [tables, setTables] = useState<RestaurantTable[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedTable, setSelectedTable] = useState<RestaurantTable | null>(null);
  const [formData, setFormData] = useState({
    guestName: '',
    guestPhone: '',
    guestEmail: '',
    reservationDate: '',
    reservationTime: '',
    partySize: 2,
    specialRequests: ''
  });

  useEffect(() => {
    loadTables();
  }, []);

  const loadTables = async () => {
    try {
      setLoading(true);
      const data = await restaurantService.getAllTables();
      setTables(data);
    } catch (error) {
      console.error('Error loading tables:', error);
      alert('Không thể tải danh sách bàn');
    } finally {
      setLoading(false);
    }
  };

  const handleTableSelect = (table: RestaurantTable) => {
    setSelectedTable(table);
    setFormData({ ...formData, partySize: Math.min(formData.partySize, table.capacity) });
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedTable) {
      alert('Vui lòng chọn bàn');
      return;
    }

    if (!formData.guestName || !formData.guestPhone || !formData.reservationDate || !formData.reservationTime) {
      alert('Vui lòng điền đầy đủ thông tin');
      return;
    }

    if (formData.partySize > selectedTable.capacity) {
      alert(`Bàn này chỉ chứa tối đa ${selectedTable.capacity} người`);
      return;
    }

    try {
      setSubmitting(true);
      const reservationData: TableReservationCreate = {
        tableId: selectedTable.id,
        guestName: formData.guestName,
        guestPhone: formData.guestPhone,
        guestEmail: formData.guestEmail || undefined,
        reservationDate: formData.reservationDate,
        reservationTime: formData.reservationTime + ':00', // Add seconds
        partySize: formData.partySize,
        specialRequests: formData.specialRequests || undefined
      };

      await restaurantService.createReservation(reservationData);
      alert('Đặt bàn thành công!');
      navigate('/my-reservations');
    } catch (error: any) {
      console.error('Error creating reservation:', error);
      const errorData = error.response?.data;
      let errorMessage = 'Không thể đặt bàn. Vui lòng thử lại.';
      if (errorData?.errors) {
        errorMessage = Object.values(errorData.errors).join(', ');
      } else if (errorData?.message) {
        errorMessage = errorData.message;
      }
      alert(errorMessage);
    } finally {
      setSubmitting(false);
    }
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
    <div className="restaurant-booking-page">
      <div className="container my-5">
        <h2 className="text-center mb-4">Đặt Bàn Nhà Hàng</h2>

        <div className="row">
          {/* Table Selection */}
          <div className="col-lg-7">
            <div className="card mb-4">
              <div className="card-header bg-primary text-white">
                <h5 className="mb-0">Chọn Bàn</h5>
              </div>
              <div className="card-body">
                <div className="row g-3">
                  {tables.map(table => (
                    <div key={table.id} className="col-md-6 col-lg-4">
                      <div
                        className={`table-card ${selectedTable?.id === table.id ? 'selected' : ''} ${table.status !== 'AVAILABLE' ? 'unavailable' : ''}`}
                        onClick={() => table.status === 'AVAILABLE' && handleTableSelect(table)}
                      >
                        <div className="table-number">{table.tableNumber}</div>
                        <div className="table-info">
                          <div><i className="fa fa-users me-2"></i>{table.capacity} người</div>
                          <div><i className="fa fa-map-marker me-2"></i>{table.location}</div>
                        </div>
                        <div className={`table-status badge ${table.status === 'AVAILABLE' ? 'bg-success' : 'bg-danger'}`}>
                          {table.status === 'AVAILABLE' ? 'Còn trống' : 'Đã đặt'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Reservation Form */}
          <div className="col-lg-5">
            <div className="card sticky-top" style={{ top: '100px' }}>
              <div className="card-header bg-primary text-white">
                <h5 className="mb-0">Thông Tin Đặt Bàn</h5>
              </div>
              <div className="card-body">
                {selectedTable ? (
                  <form onSubmit={handleSubmit}>
                    <div className="alert alert-info mb-3">
                      <strong>Bàn đã chọn:</strong> {selectedTable.tableNumber}<br />
                      <small>{selectedTable.location}</small>
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Họ Tên *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.guestName}
                        onChange={(e) => handleInputChange('guestName', e.target.value)}
                        required
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Số Điện Thoại *</label>
                      <input
                        type="tel"
                        className="form-control"
                        value={formData.guestPhone}
                        onChange={(e) => handleInputChange('guestPhone', e.target.value)}
                        required
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Email</label>
                      <input
                        type="email"
                        className="form-control"
                        value={formData.guestEmail}
                        onChange={(e) => handleInputChange('guestEmail', e.target.value)}
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Ngày Đặt *</label>
                      <input
                        type="date"
                        className="form-control"
                        value={formData.reservationDate}
                        onChange={(e) => handleInputChange('reservationDate', e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        required
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Giờ Đặt *</label>
                      <input
                        type="time"
                        className="form-control"
                        value={formData.reservationTime}
                        onChange={(e) => handleInputChange('reservationTime', e.target.value)}
                        required
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Số Người (Tối đa: {selectedTable.capacity})</label>
                      <input
                        type="number"
                        className="form-control"
                        value={formData.partySize}
                        onChange={(e) => handleInputChange('partySize', parseInt(e.target.value))}
                        min={1}
                        max={selectedTable.capacity}
                        required
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Yêu Cầu Đặc Biệt</label>
                      <textarea
                        className="form-control"
                        rows={3}
                        value={formData.specialRequests}
                        onChange={(e) => handleInputChange('specialRequests', e.target.value)}
                        placeholder="VD: Gần cửa sổ, kỷ niệm sinh nhật..."
                      />
                    </div>

                    <button
                      type="submit"
                      className="btn btn-primary w-100"
                      disabled={submitting}
                    >
                      {submitting ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2"></span>
                          Đang xử lý...
                        </>
                      ) : (
                        <>
                          <i className="fa fa-check me-2"></i>
                          Xác Nhận Đặt Bàn
                        </>
                      )}
                    </button>
                  </form>
                ) : (
                  <div className="text-center text-muted py-5">
                    <i className="fa fa-hand-pointer-o fa-3x mb-3"></i>
                    <p>Vui lòng chọn bàn để tiếp tục</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RestaurantBookingPage;
