import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { roomService } from '../services/room.service';
import { bookingService } from '../services/booking.service';
import { paymentService } from '../services/payment.service';
import { couponService } from '../services/coupon.service';
import type { Room } from '../types/room.types';
import { useAuth } from '../context/AuthContext';
import { formatPrice } from '../utils/currency';
import '../styles/BookingPage.css';

const BookingPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  // Search criteria
  const [checkInDate, setCheckInDate] = useState(searchParams.get('checkIn') || '');
  const [checkOutDate, setCheckOutDate] = useState(searchParams.get('checkOut') || '');
  const [guests, setGuests] = useState(parseInt(searchParams.get('guests') || '2'));
  
  // Results
  const [availableRooms, setAvailableRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchError, setSearchError] = useState('');
  
  // Booking state
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [specialRequests, setSpecialRequests] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [selectedDepositPercent, setSelectedDepositPercent] = useState<number>(30);
  
  // Coupon state
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState('');

  useEffect(() => {
    // Auto search if params exist
    if (checkInDate && checkOutDate) {
      handleSearch();
    }
  }, []);

  const handleSearch = async () => {
    if (!checkInDate || !checkOutDate) {
      setSearchError('Vui lòng chọn ngày nhận và trả phòng');
      return;
    }

    const start = new Date(checkInDate);
    const end = new Date(checkOutDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (start < today) {
      setSearchError('Ngày nhận phòng không được là ngày trong quá khứ');
      return;
    }

    if (end <= start) {
      setSearchError('Ngày trả phòng phải sau ngày nhận phòng');
      return;
    }

    try {
      setLoading(true);
      setSearchError('');
      
      // Search available rooms by dates and capacity
      const rooms = await roomService.searchRooms({
        checkInDate,
        checkOutDate,
        capacity: guests
      });
      
      setAvailableRooms(rooms);
      
      if (rooms.length === 0) {
        setSearchError('Không tìm thấy phòng trống phù hợp. Vui lòng thử ngày khác.');
      }
    } catch (error: any) {
      setSearchError(error.response?.data?.message || 'Có lỗi xảy ra khi tìm phòng');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const calculateNights = () => {
    if (!checkInDate || !checkOutDate) return 0;
    const start = new Date(checkInDate);
    const end = new Date(checkOutDate);
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  };

  const calculateTotalPrice = (pricePerNight: number) => {
    const total = calculateNights() * pricePerNight;
    return couponApplied ? total - discount : total;
  };

  const calculateOriginalPrice = (pricePerNight: number) => {
    return calculateNights() * pricePerNight;
  };

  const applyCoupon = async () => {
    if (!selectedRoom || !couponCode.trim()) {
      setCouponError('Vui lòng nhập mã giảm giá');
      return;
    }

    try {
      setCouponLoading(true);
      setCouponError('');
      const originalPrice = calculateOriginalPrice(selectedRoom.pricePerNight);
      const result = await couponService.validateCoupon(couponCode.trim(), originalPrice);
      
      if (result.valid) {
        setDiscount(result.discount);
        setCouponApplied(true);
        setCouponError('');
      } else {
        setCouponError(result.message || 'Mã giảm giá không hợp lệ');
        setCouponApplied(false);
        setDiscount(0);
      }
    } catch (error: any) {
      setCouponError(error?.response?.data?.message || 'Lỗi khi áp dụng mã giảm giá');
      setCouponApplied(false);
      setDiscount(0);
    } finally {
      setCouponLoading(false);
    }
  };

  const removeCoupon = () => {
    setCouponCode('');
    setCouponApplied(false);
    setDiscount(0);
    setCouponError('');
  };

  const handleBookRoom = async (room: Room) => {
    if (!isAuthenticated) {
      alert('Vui lòng đăng nhập để đặt phòng');
      navigate('/login', { state: { from: `/booking?checkIn=${checkInDate}&checkOut=${checkOutDate}&guests=${guests}` } });
      return;
    }

    setSelectedRoom(room);
  };

  const confirmBooking = async (withDeposit = false) => {
    if (!selectedRoom) return;

    try {
      // Pre-flight availability re-check to prevent race condition (room became booked after search)
      try {
        const availabilityCheck = await roomService.searchRooms({
          checkInDate,
          checkOutDate,
          capacity: guests
        });
        const stillAvailable = availabilityCheck.some(r => r.id === selectedRoom.id);
        if (!stillAvailable) {
          setBookingError('Phòng vừa được đặt bởi người khác trong khoảng ngày này. Vui lòng chọn phòng khác hoặc đổi ngày.');
          return;
        }
      } catch (probeErr) {
        console.warn('Availability probe failed, vẫn thử tiến hành đặt phòng.', probeErr);
      }

      setBookingLoading(true);
      setBookingError('');

      const booking = await bookingService.createBooking({
        roomId: selectedRoom.id,
        checkInDate,
        checkOutDate,
        numberOfGuests: guests,
        specialRequests: specialRequests || undefined,
        couponCode: couponApplied ? couponCode : undefined
      });

      console.debug('[BookingPage] created booking:', booking);

      // If customer chooses deposit, create payment and redirect to VNPay
      if (withDeposit) {
  // calculate deposit amount based on selected percent
  const totalPrice = calculateTotalPrice(selectedRoom.pricePerNight);
   const depositAmount = Math.round(totalPrice * (selectedDepositPercent / 100)); // integer VND
   // - depositAmount = làm tròn(tổng tiền * phần trăm đặt cọc)
   // - Giá trị depositAmount là số nguyên đơn vị VND (ví dụ 100000 = 100.000 VND).
   // - Lưu ý: backend sẽ nhân depositAmount với 100 khi xây dựng tham số `vnp_Amount` để gửi cho VNPay.

        try {
          // Prepare to create payment on backend. Amount is in VND and booking.id is used as reference.
          // The backend will return a signed VNPay URL which the frontend must open (redirect) so the
          // customer can complete the payment on VNPay's site.
          // NOTE: after redirect VNPay will call the configured return URL (set in VNPay config)
          // and/or IPN (server-to-server) to notify us about payment result.
          // eslint-disable-next-line no-console
          console.debug('[BookingPage] creating payment, bookingId=', booking.id, 'amount=', depositAmount);
          const resp = await paymentService.createPayment(booking.id, depositAmount);
          // eslint-disable-next-line no-console
          console.debug('[BookingPage] createPayment result:', resp);
          if (resp && resp.paymentUrl) {
            // Redirect browser to VNPay payment page (this performs the actual handoff to VNPay)
            window.location.href = resp.paymentUrl;
            return;
          } else {
            // No URL returned -> show user-friendly error
            // eslint-disable-next-line no-console
            console.error('createPayment returned no paymentUrl', resp);
            setBookingError('Không thể tạo đường dẫn thanh toán. Vui lòng thử lại.');
            return;
          }
        } catch (err: any) {
          // If backend returns an error, surface it to the user
          // eslint-disable-next-line no-console
          console.error('createPayment error', err);
          setBookingError(err?.response?.data || 'Lỗi khi tạo thanh toán.');
          return;
        }
      }

      alert('Đặt phòng thành công! Chúng tôi sẽ liên hệ với bạn sớm.');
      navigate('/my-bookings');
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        (typeof error?.response?.data === 'string' ? error.response.data : '') ||
        error?.message ||
        'Có lỗi xảy ra khi đặt phòng';
      const localized = (
        message.includes('Room is not available') ? 'Phòng đã được đặt trong khoảng ngày này.' :
        message.includes('Number of guests exceeds room capacity') ? 'Số khách vượt quá sức chứa của phòng.' :
        message.includes('Check-in date cannot be in the past') ? 'Ngày nhận phòng không được ở quá khứ.' :
        message.includes('Check-out date must be after check-in date') ? 'Ngày trả phòng phải sau ngày nhận phòng.' :
        message
      );
      setBookingError(localized);
      console.error('Booking error:', error);
    } finally {
      setBookingLoading(false);
    }
  };

  const getRoomTypeName = (type: string): string => {
    const types: Record<string, string> = {
      SINGLE: 'Phòng Đơn',
      DOUBLE: 'Phòng Đôi',
      DELUXE: 'Phòng Deluxe',
      SUITE: 'Phòng Suite',
      FAMILY: 'Phòng Gia Đình',
      PREMIUM: 'Phòng Premium'
    };
    return types[type] || type;
  };

  return (
    <div className="booking-page">
      {/* Hero Section */}
      <section className="booking-hero">
        <div className="container">
          <div className="hero-content">
            <h1>Đặt Phòng Khách Sạn</h1>
            <p>Tìm và đặt phòng lý tưởng cho kỳ nghỉ của bạn</p>
          </div>
        </div>
      </section>

      {/* Search Section */}
      <section className="booking-search">
        <div className="container">
          <div className="search-box">
            <h3>Tìm Phòng Trống</h3>
            <div className="row">
              <div className="col-md-3">
                <div className="form-group">
                  <label>Ngày nhận phòng</label>
                  <input
                    type="date"
                    className="form-control"
                    value={checkInDate}
                    onChange={(e) => setCheckInDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>
              <div className="col-md-3">
                <div className="form-group">
                  <label>Ngày trả phòng</label>
                  <input
                    type="date"
                    className="form-control"
                    value={checkOutDate}
                    onChange={(e) => setCheckOutDate(e.target.value)}
                    min={checkInDate || new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>
              <div className="col-md-2">
                <div className="form-group">
                  <label>Số khách</label>
                  <select
                    className="form-control"
                    value={guests}
                    onChange={(e) => setGuests(parseInt(e.target.value))}
                  >
                    {[1, 2, 3, 4, 5, 6].map(num => (
                      <option key={num} value={num}>{num} người</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="col-md-4">
                <div className="form-group">
                  <label>&nbsp;</label>
                  <button 
                    className="btn btn-primary btn-block"
                    onClick={handleSearch}
                    disabled={loading}
                  >
                    {loading ? 'Đang tìm...' : 'Tìm Phòng'}
                  </button>
                </div>
              </div>
            </div>
            {searchError && (
              <div className="alert alert-warning mt-3">
                <i className="fa fa-exclamation-triangle"></i> {searchError}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Results Section */}
      <section className="booking-results">
        <div className="container">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary"></div>
              <p className="mt-3">Đang tìm phòng trống...</p>
            </div>
          ) : availableRooms.length > 0 ? (
            <>
              <h3 className="mb-4">
                Có {availableRooms.length} phòng trống 
                {checkInDate && checkOutDate && ` (${calculateNights()} đêm)`}
              </h3>
              <div className="row">
                {availableRooms.map((room) => (
                  <div key={room.id} className="col-md-4 mb-4">
                    <div className="room-card">
                      <div className="room-image">
                        <img src={room.imageUrl} alt={room.roomNumber} />
                        <div className="room-badge">{getRoomTypeName(room.roomType)}</div>
                      </div>
                      <div className="room-info">
                        <h5>Phòng {room.roomNumber}</h5>
                        <p className="room-description">{room.description}</p>
                        <div className="room-features">
                          <span><i className="fa fa-users"></i> {room.capacity} người</span>
                          <span><i className="fa fa-expand"></i> {room.size}m²</span>
                        </div>
                        <div className="room-amenities">
                          {room.amenities.split(',').slice(0, 3).map((amenity, idx) => (
                            <span key={idx} className="badge badge-light">
                              {amenity.trim()}
                            </span>
                          ))}
                        </div>
                        <div className="room-pricing">
                          <div className="price-per-night">
                            {formatPrice(room.pricePerNight)} / đêm
                          </div>
                          <div className="total-price">
                            Tổng: <strong>{formatPrice(calculateTotalPrice(room.pricePerNight))}</strong>
                          </div>
                        </div>
                        <button 
                          className="btn btn-book"
                          onClick={() => handleBookRoom(room)}
                        >
                          Đặt Phòng Ngay
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : null}
        </div>
      </section>

      {/* Booking Modal */}
      {selectedRoom && (
        <div className="booking-modal-overlay" onClick={() => setSelectedRoom(null)}>
          <div className="booking-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h4>Xác nhận đặt phòng</h4>
              <button className="close-btn" onClick={() => setSelectedRoom(null)}>×</button>
            </div>
            <div className="modal-body">
              <div className="booking-summary">
                <div className="room-preview">
                  <img src={selectedRoom.imageUrl} alt={selectedRoom.roomNumber} />
                  <div>
                    <h5>{getRoomTypeName(selectedRoom.roomType)} - Phòng {selectedRoom.roomNumber}</h5>
                    <p>{selectedRoom.description}</p>
                  </div>
                </div>
                
                <div className="booking-info">
                  <div className="info-row">
                    <span>Ngày nhận phòng:</span>
                    <strong>{new Date(checkInDate).toLocaleDateString('vi-VN')}</strong>
                  </div>
                  <div className="info-row">
                    <span>Ngày trả phòng:</span>
                    <strong>{new Date(checkOutDate).toLocaleDateString('vi-VN')}</strong>
                  </div>
                  <div className="info-row">
                    <span>Số đêm:</span>
                    <strong>{calculateNights()} đêm</strong>
                  </div>
                  <div className="info-row">
                    <span>Số khách:</span>
                    <strong>{guests} người</strong>
                  </div>
                  {couponApplied && discount > 0 && (
                    <>
                      <div className="info-row">
                        <span>Giá gốc:</span>
                        <span style={{ textDecoration: 'line-through', color: '#999' }}>
                          {formatPrice(calculateOriginalPrice(selectedRoom.pricePerNight))}
                        </span>
                      </div>
                      <div className="info-row">
                        <span>Giảm giá ({couponCode}):</span>
                        <span className="text-success">-{formatPrice(discount)}</span>
                      </div>
                    </>
                  )}
                  <div className="info-row total">
                    <span>Tổng tiền:</span>
                    <strong className="text-primary">
                      {formatPrice(calculateTotalPrice(selectedRoom.pricePerNight))}
                    </strong>
                  </div>
                </div>

                <div className="form-group mt-3">
                  <label>Mã giảm giá (tùy chọn)</label>
                  <div className="d-flex gap-2">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Nhập mã giảm giá"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      disabled={couponApplied}
                    />
                    {!couponApplied ? (
                      <button 
                        className="btn btn-outline-primary" 
                        onClick={applyCoupon}
                        disabled={couponLoading || !couponCode.trim()}
                      >
                        {couponLoading ? 'Đang kiểm tra...' : 'Áp dụng'}
                      </button>
                    ) : (
                      <button 
                        className="btn btn-outline-danger" 
                        onClick={removeCoupon}
                      >
                        Hủy
                      </button>
                    )}
                  </div>
                  {couponError && (
                    <small className="text-danger d-block mt-1">{couponError}</small>
                  )}
                  {couponApplied && (
                    <small className="text-success d-block mt-1">✓ Mã giảm giá đã được áp dụng</small>
                  )}
                </div>

                <div className="form-group mt-3">
                  <label>Yêu cầu đặc biệt (tùy chọn)</label>
                  <textarea
                    className="form-control"
                    rows={3}
                    value={specialRequests}
                    onChange={(e) => setSpecialRequests(e.target.value)}
                    placeholder="Ví dụ: Giường thêm, tầng cao, view biển..."
                  ></textarea>
                </div>

                {bookingError && (
                  <div className="alert alert-danger mt-3">
                    {bookingError}
                  </div>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="btn btn-secondary" 
                onClick={() => setSelectedRoom(null)}
                disabled={bookingLoading}
              >
                Hủy
              </button>
              <button 
                className="btn btn-outline-primary" 
                onClick={() => confirmBooking(false)}
                disabled={bookingLoading}
              >
                {bookingLoading ? 'Đang xử lý...' : 'Đặt Phòng (Thanh toán sau)'}
              </button>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <select
                  value={selectedDepositPercent}
                  onChange={(e) => setSelectedDepositPercent(parseInt(e.target.value))}
                  style={{ padding: '8px 10px', borderRadius: 6, border: '1px solid #ddd' }}
                >
                  {[20,30,40,50].map(p => (
                    <option key={p} value={p}>{p}%</option>
                  ))}
                </select>

                <button 
                  className="btn btn-primary" 
                  onClick={() => confirmBooking(true)}
                  disabled={bookingLoading}
                >
                  {bookingLoading ? 'Đang xử lý...' : `Đặt Cọc ${selectedDepositPercent}% - Thanh toán qua VNPAY (${formatPrice(Math.round(calculateTotalPrice(selectedRoom.pricePerNight) * (selectedDepositPercent/100)))})`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingPage;
