import { Link, useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { roomService } from '../services/room.service';
import { bookingService } from '../services/booking.service';
import { paymentService } from '../services/payment.service';
import { foodService } from '../services/food.service';
import { restaurantService } from '../services/restaurant.service';
import { couponService } from '../services/coupon.service';
import { authService } from '../services/auth.service';
import type { Room, RoomType } from '../types/room.types';
import type { FoodItem, FoodOrderItem } from '../types/food.types';
import type { RestaurantTable } from '../types/restaurant.types';
import { useAuth } from '../context/AuthContext';
import { formatPrice } from '../utils/currency';
import '../styles/RoomDetailsPage.css';

const RoomDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Booking form state
  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');
  const [numberOfGuests, setNumberOfGuests] = useState(1);
  const [specialRequests, setSpecialRequests] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [selectedDepositPercent, setSelectedDepositPercent] = useState<number>(30);

  // Coupon state
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState('');

  // Removed checkout services modal - services now ordered AFTER payment

  // Additional Services State
  const [showRoomService, setShowRoomService] = useState(false);
  const [showRestaurantBooking, setShowRestaurantBooking] = useState(false);
  const [showAdditionalServices, setShowAdditionalServices] = useState(false);

  // Room Service State
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [selectedFoodItems, setSelectedFoodItems] = useState<FoodOrderItem[]>([]);
  const [foodNotes, setFoodNotes] = useState('');

  // Restaurant Booking State
  const [availableTables, setAvailableTables] = useState<RestaurantTable[]>([]);
  const [selectedTableId, setSelectedTableId] = useState<number | null>(null);
  const [reservationDate, setReservationDate] = useState('');
  const [reservationTime, setReservationTime] = useState('');
  const [partySize, setPartySize] = useState(2);
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [restaurantNotes, setRestaurantNotes] = useState('');

  // Load user profile to auto-fill form
  useEffect(() => {
    const loadUserProfile = async () => {
      if (isAuthenticated) {
        try {
          const userProfile = await authService.getCurrentUserApi();
          if (userProfile) {
            setGuestName(userProfile.fullName || '');
            setGuestPhone(userProfile.phoneNumber || '');
          }
        } catch (err) {
          console.error('Error loading user profile:', err);
        }
      }
    };
    loadUserProfile();
  }, [isAuthenticated]);

  // Additional Services State
  const [additionalServices, setAdditionalServices] = useState<{
    airport_pickup: boolean;
    spa: boolean;
    laundry: boolean;
    tour_guide: boolean;
  }>({
    airport_pickup: false,
    spa: false,
    laundry: false,
    tour_guide: false
  });

  useEffect(() => {
    // Load room details
    const loadRoom = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const data = await roomService.getRoomById(parseInt(id));
        setRoom(data);
        setError('');
      } catch (err: any) {
        setError('Không thể tải thông tin phòng');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadRoom();
  }, [id]);

  // Load food items when room service is enabled
  useEffect(() => {
    const loadFoodItems = async () => {
      if (showRoomService) {
        try {
          const items = await foodService.getAllFoodItems();
          setFoodItems(items.filter(item => item.available));
        } catch (err) {
          console.error('Error loading food items:', err);
        }
      }
    };
    loadFoodItems();
  }, [showRoomService]);

  // Load available tables when restaurant booking is enabled
  useEffect(() => {
    const loadTables = async () => {
      if (showRestaurantBooking) {
        try {
          const tables = await restaurantService.getAllTables();
          setAvailableTables(tables.filter(table => table.status === 'AVAILABLE'));
        } catch (err) {
          console.error('Error loading tables:', err);
        }
      }
    };
    loadTables();
  }, [showRestaurantBooking]);

  useEffect(() => {
    // Initialize jQuery plugins after component mounts
    if (typeof window !== 'undefined' && (window as any).$) {
      const $ = (window as any).$;
      
      // Initialize date picker
      $('.date-input').datepicker({
        dateFormat: 'dd-mm-yy',
        minDate: 0
      });
      
      // Initialize nice select
      if ($.fn.niceSelect) {
        $('select').niceSelect();
      }
    }
  }, []);

  const getRoomTypeName = (type: RoomType): string => {
    const types: Record<RoomType, string> = {
      SINGLE: 'Phòng Đơn',
      DOUBLE: 'Phòng Đôi',
      DELUXE: 'Phòng Deluxe',
      SUITE: 'Phòng Suite',
      FAMILY: 'Phòng Gia Đình',
      PREMIUM: 'Phòng Premium'
    };
    return types[type] || type;
  };

  const getAmenitiesList = (amenities: string): string[] => {
    return amenities.split(',').map(a => a.trim());
  };

  const calculateOriginalPrice = (): number => {
    if (!checkInDate || !checkOutDate || !room) return 0;
    
    const start = new Date(checkInDate);
    const end = new Date(checkOutDate);
    const nights = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    
    return nights > 0 ? nights * room.pricePerNight : 0;
  };

  const calculateTotalPrice = (): number => {
    const originalPrice = calculateOriginalPrice();
    return couponApplied ? originalPrice - discount : originalPrice;
  };

  const applyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError('Vui lòng nhập mã giảm giá');
      return;
    }

    const originalPrice = calculateOriginalPrice();
    if (originalPrice <= 0) {
      setCouponError('Vui lòng chọn ngày nhận và trả phòng trước');
      return;
    }

    try {
      setCouponLoading(true);
      setCouponError('');
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

  // Handle adding food item to order
  const handleAddFoodItem = (foodItem: FoodItem) => {
    const existing = selectedFoodItems.find(item => item.foodItemId === foodItem.id);
    if (existing) {
      setSelectedFoodItems(selectedFoodItems.map(item =>
        item.foodItemId === foodItem.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setSelectedFoodItems([...selectedFoodItems, {
        foodItemId: foodItem.id,
        quantity: 1,
        price: foodItem.price
      }]);
    }
  };

  const handleRemoveFoodItem = (foodItemId: number) => {
    setSelectedFoodItems(selectedFoodItems.filter(item => item.foodItemId !== foodItemId));
  };

  const handleUpdateQuantity = (foodItemId: number, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveFoodItem(foodItemId);
    } else {
      setSelectedFoodItems(selectedFoodItems.map(item =>
        item.foodItemId === foodItemId ? { ...item, quantity } : item
      ));
    }
  };

  const calculateFoodTotal = (): number => {
    return selectedFoodItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  // Handle room service order submission
  const handleRoomServiceOrder = async () => {
    if (!isAuthenticated) {
      alert('Vui lòng đăng nhập để đặt dịch vụ phòng');
      navigate('/login');
      return;
    }

    if (selectedFoodItems.length === 0) {
      alert('Vui lòng chọn ít nhất một món');
      return;
    }

    try {
      await foodService.createFoodOrder({
        roomNumber: room?.roomNumber || '',
        items: selectedFoodItems,
        specialInstructions: foodNotes
      });
      alert('Đặt món thành công! Chúng tôi sẽ giao đến phòng của bạn.');
      setSelectedFoodItems([]);
      setFoodNotes('');
      setShowRoomService(false);
    } catch (err: any) {
      const backend = err?.response?.data;
      const msg = typeof backend === 'string'
        ? backend
        : (backend?.message || err?.message || 'Có lỗi xảy ra khi đặt món');
      alert(msg);
    }
  };

  // Handle restaurant reservation submission
  const handleRestaurantReservation = async () => {
    if (!isAuthenticated) {
      alert('Vui lòng đăng nhập để đặt bàn');
      navigate('/login');
      return;
    }

    if (!selectedTableId) {
      alert('Vui lòng chọn bàn');
      return;
    }

    if (!reservationDate || !reservationTime) {
      alert('Vui lòng chọn ngày và giờ đặt bàn');
      return;
    }

    if (!guestName || !guestPhone) {
      alert('Vui lòng nhập tên và số điện thoại');
      return;
    }

    try {
      await restaurantService.createReservation({
        tableId: selectedTableId,
        guestName,
        guestPhone,
        reservationDate,
        reservationTime: `${reservationTime}:00`,
        partySize,
        specialRequests: restaurantNotes
      });
      alert('Đặt bàn thành công! Chúng tôi đã nhận được yêu cầu của bạn.');
      setSelectedTableId(null);
      setReservationDate('');
      setReservationTime('');
      setPartySize(2);
      setGuestName('');
      setGuestPhone('');
      setRestaurantNotes('');
      setShowRestaurantBooking(false);
    } catch (err: any) {
      const errorData = err?.response?.data;
      let errorMessage = 'Có lỗi xảy ra khi đặt bàn';
      if (errorData?.errors) {
        errorMessage = Object.values(errorData.errors).join(', ');
      } else if (errorData?.message) {
        errorMessage = errorData.message;
      }
      alert(errorMessage);
    }
  };

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if user is logged in
    if (!isAuthenticated) {
      alert('Vui lòng đăng nhập để đặt phòng');
      navigate('/login');
      return;
    }

    // Validate dates
    if (!checkInDate || !checkOutDate) {
      setBookingError('Vui lòng chọn ngày nhận và trả phòng');
      return;
    }

    const start = new Date(checkInDate);
    const end = new Date(checkOutDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (start < today) {
      setBookingError('Ngày nhận phòng không được là ngày trong quá khứ');
      return;
    }

    if (end <= start) {
      setBookingError('Ngày trả phòng phải sau ngày nhận phòng');
      return;
    }

    // Validate capacity
    if (!room || numberOfGuests > room.capacity) {
      setBookingError(`Số khách không được vượt quá ${room?.capacity} người`);
      return;
    }

    try {
      // availability probe
      try {
        const availabilityCheck = await roomService.searchRooms({
          checkInDate,
          checkOutDate,
          capacity: numberOfGuests
        });
        // Check if room exists in results AND is marked as available
        const roomAvailability = availabilityCheck.find(r => r.id === parseInt(id!));
        if (!roomAvailability || roomAvailability.available === false) {
          setBookingError('Phòng đã được đặt trong khoảng ngày này. Vui lòng chọn ngày khác hoặc phòng khác.');
          return;
        }
      } catch (probeErr) {
        // If search endpoint fails, continue to booking attempt but warn user
        console.warn('Availability probe failed, tiếp tục thử đặt phòng trực tiếp.', probeErr);
      }

      setBookingLoading(true);
      setBookingError('');
      
      const result = await bookingService.createBooking({
        roomId: parseInt(id!),
        checkInDate,
        checkOutDate,
        numberOfGuests,
        specialRequests: specialRequests || undefined,
        couponCode: couponApplied ? couponCode : undefined
      });

      setBookingSuccess(true);
      setBookingError('');
      
      // Redirect to additional services page with bookingId
      setTimeout(() => {
        navigate(`/additional-services?bookingId=${result.id}`);
      }, 1000);
      
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        (typeof err?.response?.data === 'string' ? err.response.data : '') ||
        err?.message ||
        'Có lỗi xảy ra khi đặt phòng';
      // Map backend known messages to Vietnamese friendly versions
      const localized = (
        message.includes('Room is not available') ? 'Phòng đã được đặt trong khoảng ngày này.' :
        message.includes('Number of guests exceeds room capacity') ? 'Số khách vượt quá sức chứa của phòng.' :
        message.includes('Check-in date cannot be in the past') ? 'Ngày nhận phòng không được ở quá khứ.' :
        message.includes('Check-out date must be after check-in date') ? 'Ngày trả phòng phải sau ngày nhận phòng.' :
        message
      );
      setBookingError(localized);
      console.error('Booking error:', err);
    } finally {
      setBookingLoading(false);
    }
  };

  const handleDepositBooking = async (e: React.MouseEvent | React.FormEvent) => {
    e.preventDefault?.();

    // Check if user is logged in
    if (!isAuthenticated) {
      alert('Vui lòng đăng nhập để đặt phòng');
      navigate('/login');
      return;
    }

    // Same validations as handleBooking
    if (!checkInDate || !checkOutDate) {
      setBookingError('Vui lòng chọn ngày nhận và trả phòng');
      return;
    }

    const start = new Date(checkInDate);
    const end = new Date(checkOutDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (start < today) {
      setBookingError('Ngày nhận phòng không được là ngày trong quá khứ');
      return;
    }

    if (end <= start) {
      setBookingError('Ngày trả phòng phải sau ngày nhận phòng');
      return;
    }

    if (!room || numberOfGuests > room.capacity) {
      setBookingError(`Số khách không được vượt quá ${room?.capacity} người`);
      return;
    }

    try {
      // availability probe
      try {
        const availabilityCheck = await roomService.searchRooms({
          checkInDate,
          checkOutDate,
          capacity: numberOfGuests
        });
        // Check if room exists in results AND is marked as available
        const roomAvailability = availabilityCheck.find(r => r.id === parseInt(id!));
        if (!roomAvailability || roomAvailability.available === false) {
          setBookingError('Phòng đã được đặt trong khoảng ngày này. Vui lòng chọn ngày khác hoặc phòng khác.');
          return;
        }
      } catch (probeErr) {
        console.warn('Availability probe failed, tiếp tục đặt phòng.', probeErr);
      }

      setBookingLoading(true);
      setBookingError('');

      // Create booking directly (no service selection modal)
      const bookingData = {
        roomId: parseInt(id!),
        checkInDate,
        checkOutDate,
        numberOfGuests,
        specialRequests: specialRequests || undefined,
        couponCode: couponApplied ? couponCode : undefined
      };

      const created = await bookingService.createBooking(bookingData);

      // Calculate deposit
      const roomTotal = calculateTotalPrice();
      const deposit = Math.round(roomTotal * (selectedDepositPercent / 100));

      // Create payment
      const resp = await paymentService.createPayment(created.id, deposit);
      console.debug('[RoomDetailsPage] createPayment resp:', resp);
      
      if (resp && resp.paymentUrl) {
        // Lưu bookingId để sau khi thanh toán sẽ redirect đến additional services
        localStorage.setItem('pendingBookingId', created.id.toString());
        window.location.href = resp.paymentUrl;
      } else {
        setBookingError('Không nhận được URL thanh toán');
      }

    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message || 'Có lỗi xảy ra khi đặt phòng';
      setBookingError(message);
      console.error('Deposit booking error:', err);
    } finally {
      setBookingLoading(false);
    }
  };

  // Removed checkout services modal functions - services now ordered AFTER payment

  if (loading) {
    return (
      <div className="container text-center py-5">
        <i className="fa fa-spinner fa-spin fa-3x"></i>
        <p className="mt-3">Đang tải thông tin phòng...</p>
      </div>
    );
  }

  if (error || !room) {
    return (
      <div className="container text-center py-5">
        <div className="alert alert-danger">
          {error || 'Không tìm thấy phòng'}
        </div>
        <Link to="/rooms" className="btn btn-primary">
          Quay lại danh sách phòng
        </Link>
      </div>
    );
  }

  return (
    <>
      {/* Breadcrumb Section Begin */}
      <div className="breadcrumb-section">
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <div className="breadcrumb-text">
                <h2>Chi Tiết Phòng</h2>
                <div className="bt-option">
                  <Link to="/">Trang Chủ</Link>
                  <Link to="/rooms">Phòng</Link>
                  <span>Chi Tiết</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Breadcrumb Section End */}

      {/* Room Details Section Begin */}
      <section className="room-details-section spad">
        <div className="container">
          <div className="row">
            <div className="col-lg-8">
              <div className="room-details-item">
                <img src={room.imageUrl} alt={`Phòng ${room.roomNumber}`} />
                <div className="rd-text">
                  <div className="rd-title">
                    <h3>{getRoomTypeName(room.roomType)} - Phòng {room.roomNumber}</h3>
                    <div className="rdt-right">
                      <div className="rating">
                        <i className="icon_star"></i>
                        <i className="icon_star"></i>
                        <i className="icon_star"></i>
                        <i className="icon_star"></i>
                        <i className="icon_star-half_alt"></i>
                      </div>
                    </div>
                  </div>
                  <h2>{formatPrice(room.pricePerNight)}<span>/Đêm</span></h2>
                  <table>
                    <tbody>
                      <tr>
                        <td className="r-o">Diện Tích:</td>
                        <td>{room.size}m²</td>
                      </tr>
                      <tr>
                        <td className="r-o">Sức Chứa:</td>
                        <td>Tối đa {room.capacity} người</td>
                      </tr>
                      <tr>
                        <td className="r-o">Loại Phòng:</td>
                        <td>{getRoomTypeName(room.roomType)}</td>
                      </tr>
                      <tr>
                        <td className="r-o">Tiện Nghi:</td>
                        <td>{room.amenities}</td>
                      </tr>
                    </tbody>
                  </table>
                  <p className="f-para">{room.description}</p>
                  <div className="amenities-list mt-4">
                    <h5>Tiện nghi phòng:</h5>
                    <div className="row">
                      {getAmenitiesList(room.amenities).map((amenity, idx) => (
                        <div key={idx} className="col-md-6">
                          <div className="amenity-item">
                            <i className="fa fa-check-circle text-success"></i>
                            <span className="ml-2">{amenity}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="rd-reviews">
                <h4>Đánh Giá</h4>
                <div className="review-item">
                  <div className="ri-pic">
                    <img src="/img/room/avatar/avatar-1.jpg" alt="" />
                  </div>
                  <div className="ri-text">
                    <span>27/08/2019</span>
                    <div className="rating">
                      <i className="icon_star"></i>
                      <i className="icon_star"></i>
                      <i className="icon_star"></i>
                      <i className="icon_star"></i>
                      <i className="icon_star"></i>
                    </div>
                    <h5>Nguyễn Thị Mai</h5>
                    <p>Phòng rất đẹp và sạch sẽ. Nhân viên nhiệt tình, thân thiện. Vị trí khách sạn thuận tiện,
                      gần nhiều điểm tham quan. Tôi rất hài lòng với chuyến nghỉ của mình tại đây và chắc chắn
                      sẽ quay lại lần sau!</p>
                  </div>
                </div>
                <div className="review-item">
                  <div className="ri-pic">
                    <img src="/img/room/avatar/avatar-2.jpg" alt="" />
                  </div>
                  <div className="ri-text">
                    <span>27/08/2019</span>
                    <div className="rating">
                      <i className="icon_star"></i>
                      <i className="icon_star"></i>
                      <i className="icon_star"></i>
                      <i className="icon_star"></i>
                      <i className="icon_star-half_alt"></i>
                    </div>
                    <h5>Trần Văn Nam</h5>
                    <p>Phòng khá tốt, view đẹp. Giường ngủ thoải mái. Điều hòa mát. Tuy nhiên giá hơi cao một chút.
                      Nhưng nhìn chung thì đáng giá tiền bỏ ra. Sẽ giới thiệu cho bạn bè.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-4">
              <div className="room-booking" id="booking">
                <h3>Đặt Phòng Của Bạn</h3>
                
                {bookingSuccess && (
                  <div className="alert alert-success mb-3">
                    Đặt phòng thành công! Đang chuyển hướng...
                  </div>
                )}
                
                {bookingError && (
                  <div className="alert alert-danger mb-3">
                    {bookingError}
                  </div>
                )}
                
                <form onSubmit={handleBooking}>
                  <div className="check-date">
                    <label htmlFor="date-in">Ngày Nhận Phòng:</label>
                    <input 
                      type="date" 
                      className="form-control" 
                      id="date-in"
                      value={checkInDate}
                      onChange={(e) => setCheckInDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      required
                    />
                    <i className="icon_calendar"></i>
                  </div>
                  <div className="check-date">
                    <label htmlFor="date-out">Ngày Trả Phòng:</label>
                    <input 
                      type="date" 
                      className="form-control" 
                      id="date-out"
                      value={checkOutDate}
                      onChange={(e) => setCheckOutDate(e.target.value)}
                      min={checkInDate || new Date().toISOString().split('T')[0]}
                      required
                    />
                    <i className="icon_calendar"></i>
                  </div>
                  <div className="select-option">
                    <label htmlFor="guest">Số Khách:</label>
                    <select 
                      id="guest"
                      className="form-control"
                      value={numberOfGuests}
                      onChange={(e) => setNumberOfGuests(parseInt(e.target.value))}
                      required
                    >
                      {room && Array.from({ length: room.capacity }, (_, i) => i + 1).map(num => (
                        <option key={num} value={num}>{num} Người</option>
                      ))}
                    </select>
                  </div>
                  <div className="special-requests">
                    <label htmlFor="requests">Yêu Cầu Đặc Biệt (Tùy chọn):</label>
                    <textarea
                      id="requests"
                      className="form-control"
                      rows={3}
                      value={specialRequests}
                      onChange={(e) => setSpecialRequests(e.target.value)}
                      placeholder="Ví dụ: Giường thêm, tầng cao, view biển..."
                    ></textarea>
                  </div>

                  {/* Coupon Input */}
                  <div className="coupon-section">
                    <label htmlFor="coupon-code">Mã Giảm Giá (Tùy chọn):</label>
                    <input
                      id="coupon-code"
                      type="text"
                      className="form-control"
                      placeholder="Nhập mã giảm giá"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      disabled={couponApplied}
                    />
                    {!couponApplied ? (
                      <button 
                        type="button"
                        className="coupon-apply-btn" 
                        onClick={applyCoupon}
                        disabled={couponLoading || !couponCode.trim()}
                      >
                        {couponLoading ? 'KIỂM TRA...' : 'ÁP DỤNG'}
                      </button>
                    ) : (
                      <button 
                        type="button"
                        className="coupon-remove-btn" 
                        onClick={removeCoupon}
                      >
                        HỦY
                      </button>
                    )}
                    {couponError && (
                      <small style={{ color: '#dc3545', display: 'block', marginTop: '5px' }}>{couponError}</small>
                    )}
                    {couponApplied && (
                      <small style={{ color: '#28a745', display: 'block', marginTop: '5px' }}>✓ Mã giảm giá đã được áp dụng</small>
                    )}
                  </div>
                  
                  {checkInDate && checkOutDate && (
                    <div className="booking-summary">
                      <div className="summary-item">
                        <span>Số đêm:</span>
                        <span>{Math.ceil((new Date(checkOutDate).getTime() - new Date(checkInDate).getTime()) / (1000 * 60 * 60 * 24))} đêm</span>
                      </div>
                      <div className="summary-item">
                        <span>Giá/đêm:</span>
                        <span>{formatPrice(room?.pricePerNight || 0)}</span>
                      </div>
                      {couponApplied && discount > 0 && (
                        <>
                          <div className="summary-item">
                            <span>Giá gốc:</span>
                            <span style={{ textDecoration: 'line-through', color: '#999' }}>
                              {formatPrice(calculateOriginalPrice())}
                            </span>
                          </div>
                          <div className="summary-item">
                            <span>Giảm giá ({couponCode}):</span>
                            <span style={{ color: '#28a745' }}>-{formatPrice(discount)}</span>
                          </div>
                        </>
                      )}
                      <div className="summary-item total">
                        <span>Tổng tiền:</span>
                        <span className="total-price">{formatPrice(calculateTotalPrice())}</span>
                      </div>
                    </div>
                  )}
                  
                  {/* Nút Đặt Phòng chính */}
                  <button 
                    type="submit" 
                    className="btn btn-primary" 
                    disabled={bookingLoading}
                    style={{ width: '100%', marginTop: '15px' }}
                  >
                    {bookingLoading ? 'Đang xử lý...' : 'Đặt Phòng'}
                  </button>

                  {/* Chỉ hiển thị đặt cọc khi tổng tiền > 0 */}
                  {calculateTotalPrice() > 0 && (
                    <div className="deposit-row" style={{ display: 'flex', gap: '10px', alignItems: 'center', marginTop: '10px' }}>
                      <select
                        value={selectedDepositPercent}
                        onChange={(e) => setSelectedDepositPercent(parseInt(e.target.value))}
                        style={{ padding: '8px 10px', borderRadius: 6, border: '1px solid #ddd' }}
                        disabled={bookingLoading}
                      >
                        {[20,30,40,50].map(p => (
                          <option key={p} value={p}>{p}%</option>
                        ))}
                      </select>

                      <button type="button" className="btn-deposit" onClick={handleDepositBooking} disabled={bookingLoading}>
                        {bookingLoading ? 'Đang xử lý...' : `Đặt cọc giữ phòng ${selectedDepositPercent}% (${formatPrice(Math.round(calculateTotalPrice() * (selectedDepositPercent/100)))})`}
                      </button>
                    </div>
                  )}
                </form>
              </div>

              {/* Additional Services Section - HIDDEN: Services now ordered AFTER payment */}
              <div className="additional-services mt-4" style={{ display: 'none' }}>
                <h3>Dịch Vụ Thêm</h3>
                
                {/* Room Service Toggle */}
                <div className="service-option">
                  <label className="service-checkbox">
                    <input 
                      type="checkbox" 
                      checked={showRoomService}
                      onChange={(e) => setShowRoomService(e.target.checked)}
                    />
                    <span className="ml-2">Room Service - Gọi đồ ăn về phòng</span>
                  </label>
                </div>

                {/* Room Service Form */}
                {showRoomService && (
                  <div className="service-form-container">
                    <h4>Đặt Room Service</h4>
                    <div className="food-items-list">
                      {foodItems.map(item => (
                        <div key={item.id} className="food-item-card">
                          <img src={item.imageUrl} alt={item.name} />
                          <div className="food-info">
                            <h5>{item.name}</h5>
                            <p className="category">{item.category}</p>
                            <p className="description">{item.description}</p>
                            <p className="price">{formatPrice(item.price)}</p>
                          </div>
                          <button 
                            className="btn-add-food"
                            onClick={() => handleAddFoodItem(item)}
                          >
                            <i className="fa fa-plus"></i> Thêm
                          </button>
                        </div>
                      ))}
                    </div>

                    {selectedFoodItems.length > 0 && (
                      <div className="selected-items mt-3">
                        <h5>Món đã chọn:</h5>
                        {selectedFoodItems.map(item => {
                          const foodItem = foodItems.find(f => f.id === item.foodItemId);
                          return (
                            <div key={item.foodItemId} className="selected-item">
                              <span>{foodItem?.name}</span>
                              <div className="quantity-controls">
                                <button onClick={() => handleUpdateQuantity(item.foodItemId, item.quantity - 1)}>-</button>
                                <span>{item.quantity}</span>
                                <button onClick={() => handleUpdateQuantity(item.foodItemId, item.quantity + 1)}>+</button>
                              </div>
                              <span className="item-total">{formatPrice(item.price * item.quantity)}</span>
                              <button 
                                className="btn-remove"
                                onClick={() => handleRemoveFoodItem(item.foodItemId)}
                              >
                                <i className="fa fa-times"></i>
                              </button>
                            </div>
                          );
                        })}
                        <div className="food-total">
                          <strong>Tổng: {formatPrice(calculateFoodTotal())}</strong>
                        </div>
                        
                        <div className="form-group mt-3">
                          <label>Ghi chú:</label>
                          <textarea
                            className="form-control"
                            rows={2}
                            value={foodNotes}
                            onChange={(e) => setFoodNotes(e.target.value)}
                            placeholder="Yêu cầu đặc biệt về món ăn..."
                          ></textarea>
                        </div>

                        <button 
                          className="btn btn-primary mt-2"
                          onClick={handleRoomServiceOrder}
                        >
                          Đặt Món
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Restaurant Booking Toggle */}
                <div className="service-option mt-3">
                  <label className="service-checkbox">
                    <input 
                      type="checkbox" 
                      checked={showRestaurantBooking}
                      onChange={(e) => setShowRestaurantBooking(e.target.checked)}
                    />
                    <span className="ml-2">Đặt bàn nhà hàng</span>
                  </label>
                </div>

                {/* Restaurant Booking Form */}
                {showRestaurantBooking && (
                  <div className="service-form-container">
                    <h4>Đặt Bàn Nhà Hàng</h4>
                    <form onSubmit={(e) => { e.preventDefault(); handleRestaurantReservation(); }}>
                      <div className="form-group">
                        <label>Chọn bàn:</label>
                        <select 
                          className="form-control"
                          value={selectedTableId || ''}
                          onChange={(e) => setSelectedTableId(parseInt(e.target.value))}
                          required
                        >
                          <option value="">-- Chọn bàn --</option>
                          {availableTables.map(table => (
                            <option key={table.id} value={table.id}>
                              Bàn {table.tableNumber} - {table.capacity} người - {table.location}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="form-group">
                        <label>Tên khách:</label>
                        <input
                          type="text"
                          className="form-control"
                          value={guestName}
                          onChange={(e) => setGuestName(e.target.value)}
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label>Số điện thoại:</label>
                        <input
                          type="tel"
                          className="form-control"
                          value={guestPhone}
                          onChange={(e) => setGuestPhone(e.target.value)}
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label>Ngày đặt:</label>
                        <input
                          type="date"
                          className="form-control"
                          value={reservationDate}
                          onChange={(e) => setReservationDate(e.target.value)}
                          min={new Date().toISOString().split('T')[0]}
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label>Giờ đặt:</label>
                        <input
                          type="time"
                          className="form-control"
                          value={reservationTime}
                          onChange={(e) => setReservationTime(e.target.value)}
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label>Số người:</label>
                        <input
                          type="number"
                          className="form-control"
                          value={partySize}
                          onChange={(e) => setPartySize(parseInt(e.target.value))}
                          min={1}
                          max={20}
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label>Yêu cầu đặc biệt:</label>
                        <textarea
                          className="form-control"
                          rows={2}
                          value={restaurantNotes}
                          onChange={(e) => setRestaurantNotes(e.target.value)}
                          placeholder="Vị trí ưa thích, dị ứng thực phẩm..."
                        ></textarea>
                      </div>

                      <button type="submit" className="btn btn-primary">
                        Đặt Bàn
                      </button>
                    </form>
                  </div>
                )}

                {/* Additional Hotel Services Toggle */}
                <div className="service-option mt-3">
                  <label className="service-checkbox">
                    <input 
                      type="checkbox" 
                      checked={showAdditionalServices}
                      onChange={(e) => setShowAdditionalServices(e.target.checked)}
                    />
                    <span className="ml-2">Dịch vụ khác</span>
                  </label>
                </div>

                {/* Additional Services Options */}
                {showAdditionalServices && (
                  <div className="service-form-container">
                    <h4>Chọn Dịch Vụ</h4>
                    <div className="services-checklist">
                      <label className="service-item">
                        <input 
                          type="checkbox"
                          checked={additionalServices.airport_pickup}
                          onChange={(e) => setAdditionalServices({
                            ...additionalServices,
                            airport_pickup: e.target.checked
                          })}
                        />
                        <span>Đưa đón sân bay</span>
                        <span className="service-price">500,000 VND</span>
                      </label>

                      <label className="service-item">
                        <input 
                          type="checkbox"
                          checked={additionalServices.spa}
                          onChange={(e) => setAdditionalServices({
                            ...additionalServices,
                            spa: e.target.checked
                          })}
                        />
                        <span>Dịch vụ Spa</span>
                        <span className="service-price">800,000 VND</span>
                      </label>

                      <label className="service-item">
                        <input 
                          type="checkbox"
                          checked={additionalServices.laundry}
                          onChange={(e) => setAdditionalServices({
                            ...additionalServices,
                            laundry: e.target.checked
                          })}
                        />
                        <span>Giặt ủi</span>
                        <span className="service-price">200,000 VND</span>
                      </label>

                      <label className="service-item">
                        <input 
                          type="checkbox"
                          checked={additionalServices.tour_guide}
                          onChange={(e) => setAdditionalServices({
                            ...additionalServices,
                            tour_guide: e.target.checked
                          })}
                        />
                        <span>Hướng dẫn viên du lịch</span>
                        <span className="service-price">1,200,000 VND/ngày</span>
                      </label>
                    </div>

                    <p className="mt-3 text-muted">
                      <small>Lưu ý: Các dịch vụ này sẽ được thêm vào hóa đơn của bạn. Nhân viên sẽ liên hệ để xác nhận chi tiết.</small>
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Room Details Section End */}
    </>
  );
};

export default RoomDetailsPage;
