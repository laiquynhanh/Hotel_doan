import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { restaurantService } from '../services/restaurant.service';
import { bookingService } from '../services/booking.service';
import { authService } from '../services/auth.service';
import type { RestaurantTable, TableReservationCreate } from '../types/restaurant.types';
import '../styles/RestaurantBookingPage.css';

const RestaurantBookingPage = () => {
  const navigate = useNavigate();
  const [tables, setTables] = useState<RestaurantTable[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedTable, setSelectedTable] = useState<RestaurantTable | null>(null);
  const [bookingId, setBookingId] = useState<number | null>(null);
  const [showContinueModal, setShowContinueModal] = useState(false);
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

  // Load user profile to auto-fill form
  useEffect(() => {
    const loadUserProfile = async () => {
      if (authService.isAuthenticated()) {
        try {
          const userProfile = await authService.getCurrentUserApi();
          if (userProfile) {
            setFormData(prev => ({
              ...prev,
              guestName: userProfile.fullName || '',
              guestPhone: userProfile.phoneNumber || '',
              guestEmail: userProfile.email || ''
            }));
          }
        } catch (err) {
          console.error('Error loading user profile:', err);
        }
      }
    };
    loadUserProfile();
  }, []);

  // Load newest active booking to link reservation
  useEffect(() => {
    const loadActiveBooking = async () => {
      try {
        const bookings = await bookingService.getMyBookings();
        const active = bookings.filter(b => b.status === 'CONFIRMED' || b.status === 'CHECKED_IN');
        if (active.length > 0) {
          const newest = active.sort((a, b) => b.bookingId - a.bookingId)[0];
          setBookingId(newest.bookingId);
        }
      } catch (err) {
        console.error('Error loading bookings for restaurant reservation:', err);
      }
    };
    loadActiveBooking();
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
      
      // Convert date from dd/MM/yyyy to yyyy-MM-dd if needed
      let formattedDate = formData.reservationDate;
      if (formattedDate.includes('/')) {
        const [day, month, year] = formattedDate.split('/');
        formattedDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      }
      
      // Convert time from 12h format (HH mm AM/PM) to 24h format (HH:mm:ss)
      let formattedTime = formData.reservationTime.trim();
      console.log('Original time:', formattedTime);
      
      // Check if it contains AM/PM indicator (CH = PM, SA = AM in Vietnamese)
      if (formattedTime.includes('CH') || formattedTime.includes('SA') || 
          formattedTime.includes('AM') || formattedTime.includes('PM')) {
        const isPM = formattedTime.includes('CH') || formattedTime.includes('PM');
        console.log('Is PM:', isPM);
        
        // Remove AM/PM/CH/SA and split
        const timeOnly = formattedTime.replace(/CH|SA|AM|PM/gi, '').trim();
        console.log('Time only:', timeOnly);
        
        const parts = timeOnly.split(/[\s:]+/); // Split by space or colon
        console.log('Time parts:', parts);
        
        let hours = Number.parseInt(parts[0], 10);
        const minutes = parts[1] ? Number.parseInt(parts[1], 10) : 0;
        console.log('Parsed hours:', hours, 'minutes:', minutes);
        
        // Convert to 24h format
        if (isPM && hours !== 12) {
          hours += 12;
        } else if (!isPM && hours === 12) {
          hours = 0;
        }
        
        formattedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`;
        console.log('Formatted time (24h):', formattedTime);
      } else if (formattedTime.includes(':')) {
        // Already in HH:mm format, just add seconds
        if (!formattedTime.endsWith(':00')) {
          formattedTime = formattedTime + ':00';
        }
        console.log('Time already in 24h format:', formattedTime);
      } else {
        console.error('Unknown time format:', formattedTime);
      }
      
      const reservationData: TableReservationCreate = {
        bookingId: bookingId || undefined,
        tableId: selectedTable.id,
        guestName: formData.guestName,
        guestPhone: formData.guestPhone,
        guestEmail: formData.guestEmail || undefined,
        reservationDate: formattedDate,
        reservationTime: formattedTime,
        partySize: formData.partySize,
        specialRequests: formData.specialRequests || undefined
      };

      console.log('Sending reservation data:', reservationData);
      await restaurantService.createReservation(reservationData);
      
      // Kiểm tra xem có đến từ AdditionalServicesPage không
      const returnToAdditional = localStorage.getItem('returnToAdditionalServices');
      if (returnToAdditional === 'true') {
        setShowContinueModal(true);
      } else {
        alert('Đặt bàn thành công!');
        navigate('/my-reservations');
      }
    } catch (error: any) {
      console.error('Error creating reservation:', error);
      const errorData = error.response?.data;
      let errorMessage = 'Không thể đặt bàn. Vui lòng thử lại.';
      
      if (errorData?.errors) {
        errorMessage = Object.values(errorData.errors).join(', ');
      } else if (errorData?.message) {
        errorMessage = errorData.message;
      } else if (typeof errorData === 'string') {
        errorMessage = errorData;
      }
      
      // Check if error is about table already booked
      if (errorMessage.toLowerCase().includes('already') || 
          errorMessage.toLowerCase().includes('đã đặt') ||
          errorMessage.toLowerCase().includes('not available') ||
          error.response?.status === 400) {
        errorMessage = `Bàn ${selectedTable.tableNumber} đã được đặt trong khung giờ này. Vui lòng chọn bàn khác hoặc khung giờ khác.`;
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

      {/* Modal hỏi tiếp tục đặt dịch vụ */}
      {showContinueModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '40px 30px',
            maxWidth: '500px',
            textAlign: 'center',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
            animation: 'fadeIn 0.3s ease'
          }}>
            <div style={{
              fontSize: '50px',
              marginBottom: '20px'
            }}>
              ✅
            </div>
            <h3 style={{
              fontSize: '1.5rem',
              marginBottom: '15px',
              fontWeight: '600',
              color: '#333'
            }}>
              Đặt hàng thành công!
            </h3>
            <p style={{
              fontSize: '1rem',
              color: '#666',
              marginBottom: '30px',
              lineHeight: '1.5'
            }}>
              Bạn có muốn đặt thêm gì không?
            </p>
            
            <div style={{
              display: 'flex',
              gap: '15px',
              justifyContent: 'center'
            }}>
              <button
                onClick={() => {
                  localStorage.removeItem('returnToAdditionalServices');
                  localStorage.removeItem('currentBookingId');
                  setShowContinueModal(false);
                  navigate('/my-bookings');
                }}
                style={{
                  padding: '12px 30px',
                  borderRadius: '6px',
                  border: '1px solid #ddd',
                  backgroundColor: '#f5f5f5',
                  color: '#333',
                  fontSize: '1rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = '#e8e8e8';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = '#f5f5f5';
                }}
              >
                Không, quay về
              </button>
              <button
                onClick={() => {
                  const bookingIdFromStorage = localStorage.getItem('currentBookingId');
                  setShowContinueModal(false);
                  navigate(`/additional-services?bookingId=${bookingIdFromStorage}`);
                }}
                style={{
                  padding: '12px 30px',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: '#2ecc71',
                  color: 'white',
                  fontSize: '1rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = '#27ae60';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = '#2ecc71';
                }}
              >
                Có, tiếp tục
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
};

export default RestaurantBookingPage;
