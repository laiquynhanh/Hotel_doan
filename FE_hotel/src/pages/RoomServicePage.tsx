import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { foodService } from '../services/food.service';
import { bookingService } from '../services/booking.service';
import { formatPrice } from '../utils/currency';
import type { FoodItem, CartItem, FoodOrderCreate } from '../types/food.types';
import '../styles/RoomServicePage.css';

const RoomServicePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [roomNumber, setRoomNumber] = useState('');
  const [bookingId, setBookingId] = useState<number | null>(null);
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [showContinueModal, setShowContinueModal] = useState(false);

  const categories = [
    { value: 'ALL', label: 'Tất Cả' },
    { value: 'BREAKFAST', label: 'Bữa Sáng' },
    { value: 'LUNCH', label: 'Bữa Trưa' },
    { value: 'DINNER', label: 'Bữa Tối' },
    { value: 'DRINKS', label: 'Đồ Uống' },
    { value: 'DESSERT', label: 'Tráng Miệng' }
  ];

  useEffect(() => {
    if (!user) {
      alert('Vui lòng đăng nhập để đặt món');
      navigate('/login');
      return;
    }
    loadFoodItems();
    loadUserBooking();
  }, [user, navigate]);

  const loadUserBooking = async () => {
    try {
      const bookings = await bookingService.getMyBookings();
      // Find active bookings (CONFIRMED or CHECKED_IN) and get the NEWEST one
      const activeBookings = bookings.filter(
        booking => booking.status === 'CONFIRMED' || booking.status === 'CHECKED_IN'
      );
      
      if (activeBookings.length > 0) {
        // Sort by bookingId descending to get the newest booking
        const newestBooking = activeBookings.sort((a, b) => b.bookingId - a.bookingId)[0];
        setRoomNumber(newestBooking.roomNumber);
        setBookingId(newestBooking.bookingId);
        console.log('[DEBUG] RoomServicePage - Loaded booking:', newestBooking.bookingId, 'for room:', newestBooking.roomNumber);
      }
    } catch (error) {
      console.error('Error loading bookings:', error);
    }
  };

  const loadFoodItems = async () => {
    try {
      setLoading(true);
      const data = await foodService.getAllFoodItems();
      setFoodItems(data);
    } catch (error) {
      console.error('Error loading food items:', error);
      alert('Không thể tải menu');
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = selectedCategory === 'ALL'
    ? foodItems
    : foodItems.filter(item => item.category === selectedCategory);

  const addToCart = (item: FoodItem) => {
    const existingItem = cart.find(cartItem => cartItem.id === item.id);
    if (existingItem) {
      setCart(cart.map(cartItem =>
        cartItem.id === item.id
          ? { ...cartItem, quantity: cartItem.quantity + 1 }
          : cartItem
      ));
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
    }
  };

  const removeFromCart = (itemId: number) => {
    setCart(cart.filter(item => item.id !== itemId));
  };

  const updateQuantity = (itemId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    setCart(cart.map(item =>
      item.id === itemId ? { ...item, quantity } : item
    ));
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const handleSubmitOrder = async () => {
    if (cart.length === 0) {
      alert('Giỏ hàng trống');
      return;
    }

    if (!roomNumber || !roomNumber.trim()) {
      alert('Bạn chưa có đặt phòng nào. Vui lòng đặt phòng trước khi đặt món.');
      return;
    }

    try {
      setSubmitting(true);
      const orderData: FoodOrderCreate = {
        bookingId: bookingId || undefined,
        roomNumber: roomNumber.trim(),
        items: cart.map(item => ({
          foodItemId: item.id,
          quantity: item.quantity,
          price: item.price
        })),
        specialInstructions: specialInstructions.trim() || undefined
      };

      console.log('[DEBUG] RoomServicePage - Submitting order with bookingId:', bookingId);
      console.log('[DEBUG] RoomServicePage - Order data:', JSON.stringify(orderData, null, 2));

      await foodService.createFoodOrder(orderData);
      setCart([]);
      setRoomNumber('');
      setSpecialInstructions('');
      
      // Kiểm tra xem có đến từ AdditionalServicesPage không
      const returnToAdditional = localStorage.getItem('returnToAdditionalServices');
      if (returnToAdditional === 'true') {
        setShowContinueModal(true);
      } else {
        navigate('/my-food-orders');
      }
    } catch (error: any) {
      console.error('Error creating order:', error);
      alert(error.response?.data || 'Không thể đặt món. Vui lòng thử lại.');
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
    <div className="room-service-page">
      {/* Breadcrumb Banner */}
      <div className="breadcrumb-section">
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <div className="breadcrumb-text">
                <h2>Thực Đơn Khách Sạn</h2>
                <div className="bt-option">
                  <a href="/">Trang Chủ</a>
                  <span>Room Service</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container my-5">
        <h2 className="text-center mb-4">Đặt Món Room Service</h2>

        <div className="row">
          {/* Menu Section */}
          <div className="col-lg-8">
            {/* Category Filter */}
            <div className="category-tabs mb-4">
              {categories.map(cat => (
                <button
                  key={cat.value}
                  className={`btn ${selectedCategory === cat.value ? 'btn-primary' : 'btn-outline-primary'} me-2 mb-2`}
                  onClick={() => setSelectedCategory(cat.value)}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Food Items */}
            <div className="food-list">
              {filteredItems.map(item => (
                <div key={item.id} className="food-item-card mb-3">
                  <div className="row g-0">
                    <div className="col-md-3">
                      <img
                        src={item.imageUrl || '/img/food/default.jpg'}
                        alt={item.name}
                        className="img-fluid rounded-start"
                        style={{ height: '150px', width: '100%', objectFit: 'cover' }}
                        onError={(e) => {
                          e.currentTarget.src = '/img/food/default.jpg';
                        }}
                      />
                    </div>
                    <div className="col-md-6">
                      <div className="card-body">
                        <h5 className="card-title">{item.name}</h5>
                        <p className="card-text text-muted small">{item.description}</p>
                        <p className="card-text">
                          <strong className="text-primary">{formatPrice(item.price)}</strong>
                        </p>
                        <p className="card-text">
                          <span className={`badge ${item.stockQuantity > 10 ? 'bg-success' : item.stockQuantity > 0 ? 'bg-warning' : 'bg-danger'}`}>
                            Số lượng: {item.stockQuantity}
                          </span>
                        </p>
                      </div>
                    </div>
                    <div className="col-md-3 d-flex align-items-center justify-content-center">
                      {item.available && item.stockQuantity > 0 ? (
                        <button
                          className="btn btn-primary"
                          onClick={() => addToCart(item)}
                        >
                          <i className="fa fa-plus me-2"></i>Thêm
                        </button>
                      ) : (
                        <span className="badge bg-danger">
                          {item.stockQuantity === 0 ? 'Món tạm thời đã hết' : 'Hết hàng'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Cart Section */}
          <div className="col-lg-4">
            <div className="cart-sidebar sticky-top">
              <div className="card">
                <div className="card-header bg-primary text-white">
                  <h5 className="mb-0">
                    <i className="fa fa-shopping-cart me-2"></i>
                    Giỏ Hàng ({cart.length})
                  </h5>
                </div>
                <div className="card-body">
                  {cart.length === 0 ? (
                    <p className="text-center text-muted">Giỏ hàng trống</p>
                  ) : (
                    <>
                      <div className="cart-items mb-3">
                        {cart.map(item => (
                          <div key={item.id} className="cart-item mb-3 pb-3 border-bottom">
                            <div className="d-flex justify-content-between align-items-start mb-2">
                              <strong>{item.name}</strong>
                              <button
                                className="btn btn-sm btn-link text-danger p-0"
                                onClick={() => removeFromCart(item.id)}
                              >
                                <i className="fa fa-trash"></i>
                              </button>
                            </div>
                            <div className="d-flex justify-content-between align-items-center">
                              <div className="quantity-control">
                                <button
                                  className="btn btn-sm btn-outline-secondary"
                                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                >
                                  -
                                </button>
                                <span className="mx-2">{item.quantity}</span>
                                <button
                                  className="btn btn-sm btn-outline-secondary"
                                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                >
                                  +
                                </button>
                              </div>
                              <strong>{formatPrice(item.price * item.quantity)}</strong>
                            </div>
                          </div>
                        ))}
                      </div>

                      {!roomNumber && (
                        <div className="alert alert-warning mb-3">
                          <i className="fa fa-exclamation-triangle me-2"></i>
                          <strong>Bạn chưa có đặt phòng</strong>
                          <p className="mb-0 mt-1">
                            Vui lòng đặt phòng trước để sử dụng dịch vụ Room Service.
                            <a href="/rooms" className="alert-link ms-2">Đặt phòng ngay →</a>
                          </p>
                        </div>
                      )}
                      
                      {roomNumber && (
                        <div className="alert alert-info mb-3">
                          <i className="fa fa-check-circle me-2"></i>
                          <strong>Giao đến phòng: {roomNumber}</strong>
                        </div>
                      )}

                      <div className="mb-3">
                        <label className="form-label">Ghi Chú</label>
                        <textarea
                          className="form-control"
                          rows={3}
                          placeholder="Yêu cầu đặc biệt..."
                          value={specialInstructions}
                          onChange={(e) => setSpecialInstructions(e.target.value)}
                        />
                      </div>

                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <strong>Tổng cộng:</strong>
                        <strong className="text-primary fs-4">
                          {formatPrice(calculateTotal())}
                        </strong>
                      </div>

                      <button
                        className="btn btn-primary w-100"
                        onClick={handleSubmitOrder}
                        disabled={submitting || cart.length === 0 || !roomNumber.trim()}
                      >
                        {submitting ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2"></span>
                            Đang xử lý...
                          </>
                        ) : (
                          <>
                            <i className="fa fa-check me-2"></i>
                            Đặt Món
                          </>
                        )}
                      </button>
                    </>
                  )}
                </div>
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
          zIndex: 1000
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

export default RoomServicePage;
