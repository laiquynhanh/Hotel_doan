import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { paymentService } from '../services/payment.service';
import { bookingService } from '../services/booking.service';
import { foodService } from '../services/food.service';
import { restaurantService } from '../services/restaurant.service';
import type { FoodItem, FoodOrderItem } from '../types/food.types';
import type { RestaurantTable } from '../types/restaurant.types';
import { formatPrice } from '../utils/currency';
import { toast } from 'react-toastify';

const PaymentResult = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading'|'success'|'failed'>('loading');
  const [message, setMessage] = useState('Đang xác thực thanh toán...');

  // Food Service State
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [selectedFoodItems, setSelectedFoodItems] = useState<FoodOrderItem[]>([]);
  const [foodNotes, setFoodNotes] = useState('');
  const [foodLoading, setFoodLoading] = useState(false);

  // Restaurant Booking State
  const [availableTables, setAvailableTables] = useState<RestaurantTable[]>([]);
  const [selectedTableId, setSelectedTableId] = useState<number | null>(null);
  const [reservationDate, setReservationDate] = useState('');
  const [reservationTime, setReservationTime] = useState('');
  const [partySize, setPartySize] = useState(2);
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [restaurantNotes, setRestaurantNotes] = useState('');
  const [restaurantLoading, setRestaurantLoading] = useState(false);

  // Additional Services State
  const [additionalServices, setAdditionalServices] = useState({
    airport_pickup: false,
    spa: false,
    laundry: false,
    tour_guide: false
  });
  const [showPremiumConfirm, setShowPremiumConfirm] = useState(false);
  const [pendingServiceChange, setPendingServiceChange] = useState<{service: string, value: boolean} | null>(null);
  const [bookingId, setBookingId] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const paramsObj: Record<string,string> = {};
        searchParams.forEach((v,k) => paramsObj[k] = v);
        const result = await paymentService.verifyVNPayReturn(paramsObj);
        if (result.isValid && result.responseCode === '00') {
          setStatus('success');
          setMessage('Thanh toán thành công!');
          
          // Save booking ID for premium services update
          if (result.bookingId) {
            setBookingId(result.bookingId);
          }
          
          // Load food items and restaurant tables for additional services
          loadFoodItems();
          loadRestaurantTables();
        } else {
          setStatus('failed');
          setMessage(result.message || 'Thanh toán thất bại');
        }
      } catch (e) {
        setStatus('failed');
        setMessage('Lỗi xác thực thanh toán');
      }
    })();
  }, []);

  const loadFoodItems = async () => {
    try {
      const items = await foodService.getAllFoodItems();
      setFoodItems(items.filter(item => item.available));
    } catch (err) {
      console.error('Failed to load food items:', err);
    }
  };

  const loadRestaurantTables = async () => {
    try {
      const tables = await restaurantService.getAllTables();
      setAvailableTables(tables.filter(table => table.status === 'AVAILABLE'));
    } catch (err) {
      console.error('Failed to load tables:', err);
    }
  };

  // Food Service Handlers
  const handleAddFoodItem = (item: FoodItem) => {
    const existing = selectedFoodItems.find(f => f.foodItemId === item.id);
    if (existing) {
      setSelectedFoodItems(selectedFoodItems.map(f =>
        f.foodItemId === item.id ? { ...f, quantity: f.quantity + 1 } : f
      ));
    } else {
      setSelectedFoodItems([...selectedFoodItems, {
        foodItemId: item.id,
        quantity: 1,
        price: item.price
      }]);
    }
  };

  const handleRemoveFoodItem = (foodItemId: number) => {
    setSelectedFoodItems(selectedFoodItems.filter(f => f.foodItemId !== foodItemId));
  };

  const handleUpdateQuantity = (foodItemId: number, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveFoodItem(foodItemId);
    } else {
      setSelectedFoodItems(selectedFoodItems.map(f =>
        f.foodItemId === foodItemId ? { ...f, quantity } : f
      ));
    }
  };

  const calculateFoodTotal = () => {
    return selectedFoodItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const handleFoodOrder = async () => {
    if (selectedFoodItems.length === 0) {
      toast.warning('Vui lòng chọn ít nhất một món');
      return;
    }

    try {
      setFoodLoading(true);
      await foodService.createFoodOrder({
        items: selectedFoodItems,
        specialInstructions: foodNotes
      });
      toast.success('Đặt đồ ăn thành công!');
      setSelectedFoodItems([]);
      setFoodNotes('');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Có lỗi khi đặt đồ ăn');
    } finally {
      setFoodLoading(false);
    }
  };

  // Restaurant Booking Handler
  const handleRestaurantReservation = async () => {
    if (!selectedTableId || !reservationDate || !reservationTime || !guestName || !guestPhone) {
      toast.warning('Vui lòng điền đầy đủ thông tin');
      return;
    }

    try {
      setRestaurantLoading(true);
      // Format time to HH:mm:ss for backend
      const formattedTime = reservationTime.length === 5 ? `${reservationTime}:00` : reservationTime;
      await restaurantService.createReservation({
        tableId: selectedTableId,
        guestName,
        guestPhone,
        reservationDate,
        reservationTime: formattedTime,
        partySize,
        specialRequests: restaurantNotes
      });
      toast.success('Đặt bàn thành công!');
      setSelectedTableId(null);
      setReservationDate('');
      setReservationTime('');
      setGuestName('');
      setGuestPhone('');
      setRestaurantNotes('');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Có lỗi khi đặt bàn');
    } finally {
      setRestaurantLoading(false);
    }
  };

  // Premium Service Handlers
  const handlePremiumServiceClick = (service: string, currentValue: boolean) => {
    setPendingServiceChange({ service, value: !currentValue });
    setShowPremiumConfirm(true);
  };

  const confirmPremiumService = async () => {
    if (pendingServiceChange && bookingId) {
      try {
        // Update local state
        setAdditionalServices({
          ...additionalServices,
          [pendingServiceChange.service]: pendingServiceChange.value
        });
        
        // Map service name to API parameter
        const serviceMapping: Record<string, string> = {
          airport_pickup: 'airportPickup',
          spa: 'spaService',
          laundry: 'laundryService',
          tour_guide: 'tourGuide'
        };
        
        // Call API to save to database
        const updateData: any = {};
        updateData[serviceMapping[pendingServiceChange.service]] = pendingServiceChange.value;
        
        await bookingService.updatePremiumServices(bookingId, updateData);
        
        if (pendingServiceChange.value) {
          const serviceNames: Record<string, string> = {
            airport_pickup: 'Đưa đón sân bay',
            spa: 'Dịch vụ Spa',
            laundry: 'Giặt ủi',
            tour_guide: 'Hướng dẫn viên'
          };
          toast.success(`Đã thêm dịch vụ ${serviceNames[pendingServiceChange.service]}. Admin sẽ liên hệ với bạn trong 30 phút.`);
        }
      } catch (error) {
        toast.error('Không thể cập nhật dịch vụ. Vui lòng thử lại.');
        console.error('Error updating premium service:', error);
      }
    }
    setShowPremiumConfirm(false);
    setPendingServiceChange(null);
  };

  const cancelPremiumService = () => {
    setShowPremiumConfirm(false);
    setPendingServiceChange(null);
  };

  return (
    <div style={{ background: 'linear-gradient(to bottom, #f8f9fa 0%, #ffffff 100%)', minHeight: '100vh', paddingTop: '40px' }}>
      {status === 'loading' && (
        <div className="container text-center py-5">
          <div className="spinner-border text-warning" style={{ width: '3rem', height: '3rem' }}></div>
          <p className="mt-3" style={{ fontSize: '1.1rem', color: '#6c757d' }}>{message}</p>
        </div>
      )}

      {status === 'success' && (
        <>
          {/* Success Hero Section */}
          <div className="container text-center mb-5" style={{ maxWidth: '800px' }}>
            <div style={{
              background: 'linear-gradient(135deg, #dfa974 0%, #c89961 100%)',
              borderRadius: '20px',
              padding: '50px 30px',
              color: 'white',
              boxShadow: '0 20px 60px rgba(223, 169, 116, 0.3)',
              marginBottom: '40px'
            }}>
              <div style={{ 
                width: '80px', 
                height: '80px', 
                background: 'rgba(255,255,255,0.2)', 
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
                backdropFilter: 'blur(10px)'
              }}>
                <i className="fa fa-check" style={{ fontSize: '40px' }}></i>
              </div>
              <h1 style={{ fontSize: '2.5rem', fontWeight: '700', marginBottom: '10px' }}>Thanh Toán Thành Công!</h1>
              <p style={{ fontSize: '1.1rem', opacity: 0.95, marginBottom: '30px' }}>Cảm ơn bạn đã đặt phòng tại Sona Hotel</p>
              <button 
                className="btn btn-light btn-lg"
                onClick={() => navigate('/my-bookings')}
                style={{
                  padding: '12px 40px',
                  borderRadius: '50px',
                  fontWeight: '600',
                  boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
                  transition: 'all 0.3s ease'
                }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <i className="fa fa-calendar-check me-2"></i>
                Xem Đơn Đặt Phòng
              </button>
            </div>
          </div>

          {/* Additional Services Section */}
          <div className="container" style={{ maxWidth: '1400px', paddingBottom: '60px' }}>
            {/* Section Header */}
            <div className="text-center mb-5">
              <span style={{
                display: 'inline-block',
                padding: '8px 24px',
                background: 'linear-gradient(135deg, #dfa974 0%, #c89961 100%)',
                color: 'white',
                borderRadius: '50px',
                fontSize: '0.85rem',
                fontWeight: '600',
                letterSpacing: '1px',
                textTransform: 'uppercase',
                marginBottom: '15px'
              }}>
                Nâng Cao Trải Nghiệm
              </span>
              <h2 style={{ fontSize: '2.5rem', fontWeight: '700', color: '#2c3e50', marginBottom: '10px' }}>
                Dịch Vụ Cao Cấp
              </h2>
              <p style={{ fontSize: '1.1rem', color: '#6c757d', maxWidth: '600px', margin: '0 auto' }}>
                Bổ sung các dịch vụ đặc biệt để chuyến đi của bạn trở nên hoàn hảo hơn
              </p>
            </div>

            <div className="row g-4">
              {/* Food Service Section */}
              <div className="col-lg-6 mb-4">
                <div className="card h-100" style={{
                  border: 'none',
                  borderRadius: '20px',
                  overflow: 'hidden',
                  boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-5px)';
                  e.currentTarget.style.boxShadow = '0 15px 50px rgba(0,0,0,0.12)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 10px 40px rgba(0,0,0,0.08)';
                }}>
                  <div style={{
                    background: 'linear-gradient(135deg, #dfa974 0%, #c89961 100%)',
                    padding: '25px',
                    color: 'white'
                  }}>
                    <div className="d-flex align-items-center">
                      <div style={{
                        width: '50px',
                        height: '50px',
                        background: 'rgba(255,255,255,0.2)',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: '15px'
                      }}>
                        <i className="fa fa-utensils" style={{ fontSize: '24px' }}></i>
                      </div>
                      <div>
                        <h4 className="mb-0" style={{ fontWeight: '700' }}>Room Service</h4>
                        <small style={{ opacity: 0.9 }}>Gọi đồ ăn về phòng</small>
                      </div>
                    </div>
                  </div>
                  <div className="card-body" style={{ maxHeight: '500px', overflowY: 'auto', padding: '25px' }}>
                    {foodItems.length > 0 ? (
                      <>
                        <div className="food-items-grid">
                          {foodItems.slice(0, 6).map(item => (
                            <div key={item.id} style={{
                              background: '#f8f9fa',
                              borderRadius: '12px',
                              padding: '15px',
                              marginBottom: '12px',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              transition: 'all 0.2s ease',
                              border: '2px solid transparent'
                            }}
                            onMouseOver={(e) => {
                              e.currentTarget.style.background = '#fff';
                              e.currentTarget.style.borderColor = '#dfa974';
                            }}
                            onMouseOut={(e) => {
                              e.currentTarget.style.background = '#f8f9fa';
                              e.currentTarget.style.borderColor = 'transparent';
                            }}>
                              <div>
                                <strong style={{ fontSize: '1rem', color: '#2c3e50' }}>{item.name}</strong>
                                <div className="text-muted small" style={{ marginTop: '4px' }}>
                                  <i className="fa fa-tag me-1"></i>{item.category}
                                </div>
                                <div style={{ color: '#dfa974', fontWeight: '600', marginTop: '6px' }}>
                                  {formatPrice(item.price)}
                                </div>
                              </div>
                              <button 
                                style={{
                                  background: 'linear-gradient(135deg, #dfa974 0%, #c89961 100%)',
                                  border: 'none',
                                  borderRadius: '10px',
                                  width: '40px',
                                  height: '40px',
                                  color: 'white',
                                  cursor: 'pointer',
                                  transition: 'transform 0.2s ease'
                                }}
                                onClick={() => handleAddFoodItem(item)}
                                onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                                onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                              >
                                <i className="fa fa-plus"></i>
                              </button>
                            </div>
                          ))}
                        </div>

                        {selectedFoodItems.length > 0 && (
                          <div className="mt-4 pt-4" style={{ borderTop: '2px solid #e9ecef' }}>
                            <h6 style={{ color: '#2c3e50', fontWeight: '700', marginBottom: '15px' }}>
                              <i className="fa fa-shopping-cart me-2"></i>Đã chọn:
                            </h6>
                            {selectedFoodItems.map(item => {
                              const foodItem = foodItems.find(f => f.id === item.foodItemId);
                              return (
                                <div key={item.foodItemId} style={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'center',
                                  marginBottom: '12px',
                                  padding: '12px',
                                  background: 'linear-gradient(to right, #f8f9fa 0%, #fff 100%)',
                                  borderRadius: '10px',
                                  border: '1px solid #e9ecef'
                                }}>
                                  <span>{foodItem?.name}</span>
                                  <div className="d-flex align-items-center gap-2">
                                    <button 
                                      className="btn btn-sm btn-outline-secondary"
                                      onClick={() => handleUpdateQuantity(item.foodItemId, item.quantity - 1)}
                                    >
                                      -
                                    </button>
                                    <span className="px-2">{item.quantity}</span>
                                    <button 
                                      className="btn btn-sm btn-outline-secondary"
                                      onClick={() => handleUpdateQuantity(item.foodItemId, item.quantity + 1)}
                                    >
                                      +
                                    </button>
                                    <button 
                                      className="btn btn-sm btn-danger ms-2"
                                      onClick={() => handleRemoveFoodItem(item.foodItemId)}
                                    >
                                      <i className="fa fa-times"></i>
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                            <div style={{
                              background: 'linear-gradient(135deg, #dfa974 0%, #c89961 100%)',
                              padding: '15px',
                              borderRadius: '12px',
                              marginTop: '15px',
                              color: 'white'
                            }}>
                              <div className="d-flex justify-content-between align-items-center">
                                <span style={{ fontSize: '1rem' }}>Tổng cộng:</span>
                                <strong style={{ fontSize: '1.3rem' }}>{formatPrice(calculateFoodTotal())}</strong>
                              </div>
                            </div>
                            <textarea
                              style={{
                                border: '2px solid #e9ecef',
                                borderRadius: '10px',
                                padding: '12px',
                                marginTop: '15px',
                                marginBottom: '15px',
                                width: '100%',
                                resize: 'none',
                                transition: 'border-color 0.3s ease'
                              }}
                              rows={2}
                              placeholder="💬 Ghi chú đặc biệt (tùy chọn)..."
                              value={foodNotes}
                              onChange={(e) => setFoodNotes(e.target.value)}
                              onFocus={(e) => e.currentTarget.style.borderColor = '#dfa974'}
                              onBlur={(e) => e.currentTarget.style.borderColor = '#e9ecef'}
                            />
                            <button 
                              style={{
                                background: 'linear-gradient(135deg, #dfa974 0%, #c89961 100%)',
                                border: 'none',
                                borderRadius: '12px',
                                padding: '14px',
                                width: '100%',
                                color: 'white',
                                fontWeight: '600',
                                fontSize: '1rem',
                                cursor: 'pointer',
                                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                                boxShadow: '0 4px 15px rgba(223, 169, 116, 0.3)'
                              }}
                              onClick={handleFoodOrder}
                              disabled={foodLoading}
                              onMouseOver={(e) => {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 6px 20px rgba(223, 169, 116, 0.4)';
                              }}
                              onMouseOut={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 4px 15px rgba(223, 169, 116, 0.3)';
                              }}
                            >
                              {foodLoading ? (
                                <>
                                  <i className="fa fa-spinner fa-spin me-2"></i>Đang xử lý...
                                </>
                              ) : (
                                <>
                                  <i className="fa fa-check-circle me-2"></i>Đặt Đồ Ăn Ngay
                                </>
                              )}
                            </button>
                          </div>
                        )}
                      </>
                    ) : (
                      <p className="text-muted">Đang tải menu...</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Restaurant Booking Section */}
              <div className="col-lg-6 mb-4">
                <div className="card h-100" style={{
                  border: 'none',
                  borderRadius: '20px',
                  overflow: 'hidden',
                  boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-5px)';
                  e.currentTarget.style.boxShadow = '0 15px 50px rgba(0,0,0,0.12)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 10px 40px rgba(0,0,0,0.08)';
                }}>
                  <div style={{
                    background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
                    padding: '25px',
                    color: 'white'
                  }}>
                    <div className="d-flex align-items-center">
                      <div style={{
                        width: '50px',
                        height: '50px',
                        background: 'rgba(255,255,255,0.2)',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: '15px'
                      }}>
                        <i className="fa fa-concierge-bell" style={{ fontSize: '24px' }}></i>
                      </div>
                      <div>
                        <h4 className="mb-0" style={{ fontWeight: '700' }}>Đặt Bàn</h4>
                        <small style={{ opacity: 0.9 }}>Nhà hàng cao cấp</small>
                      </div>
                    </div>
                  </div>
                  <div className="card-body" style={{ maxHeight: '500px', overflowY: 'auto', padding: '25px' }}>
                    <form onSubmit={(e) => { e.preventDefault(); handleRestaurantReservation(); }}>
                      <div className="mb-3">
                        <label className="form-label">Chọn bàn:</label>
                        <select 
                          className="form-select"
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

                      <div className="mb-3">
                        <label className="form-label">Tên khách:</label>
                        <input
                          type="text"
                          className="form-control"
                          value={guestName}
                          onChange={(e) => setGuestName(e.target.value)}
                          required
                        />
                      </div>

                      <div className="mb-3">
                        <label className="form-label">Số điện thoại:</label>
                        <input
                          type="tel"
                          className="form-control"
                          value={guestPhone}
                          onChange={(e) => setGuestPhone(e.target.value)}
                          required
                        />
                      </div>

                      <div className="mb-3">
                        <label className="form-label">Ngày đặt:</label>
                        <input
                          type="date"
                          className="form-control"
                          value={reservationDate}
                          onChange={(e) => setReservationDate(e.target.value)}
                          min={new Date().toISOString().split('T')[0]}
                          required
                        />
                      </div>

                      <div className="mb-3">
                        <label className="form-label">Giờ đặt:</label>
                        <input
                          type="time"
                          className="form-control"
                          value={reservationTime}
                          onChange={(e) => setReservationTime(e.target.value)}
                          required
                        />
                      </div>

                      <div className="mb-3">
                        <label className="form-label">Số người:</label>
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

                      <div className="mb-3">
                        <label className="form-label">Yêu cầu đặc biệt:</label>
                        <textarea
                          className="form-control"
                          rows={2}
                          value={restaurantNotes}
                          onChange={(e) => setRestaurantNotes(e.target.value)}
                          placeholder="Vị trí ưa thích, dị ứng thực phẩm..."
                        />
                      </div>

                      <button 
                        type="submit"
                        style={{
                          background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
                          border: 'none',
                          borderRadius: '12px',
                          padding: '14px',
                          width: '100%',
                          color: 'white',
                          fontWeight: '600',
                          fontSize: '1rem',
                          cursor: 'pointer',
                          transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                          boxShadow: '0 4px 15px rgba(44, 62, 80, 0.3)'
                        }}
                        disabled={restaurantLoading}
                        onMouseOver={(e) => {
                          e.currentTarget.style.transform = 'translateY(-2px)';
                          e.currentTarget.style.boxShadow = '0 6px 20px rgba(44, 62, 80, 0.4)';
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = '0 4px 15px rgba(44, 62, 80, 0.3)';
                        }}
                      >
                        {restaurantLoading ? (
                          <>
                            <i className="fa fa-spinner fa-spin me-2"></i>Đang xử lý...
                          </>
                        ) : (
                          <>
                            <i className="fa fa-calendar-check me-2"></i>Xác Nhận Đặt Bàn
                          </>
                        )}
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Services (Airport, Spa, etc.) */}
            <div className="row mt-5">
              <div className="col-12">
                <div className="card" style={{
                  border: 'none',
                  borderRadius: '20px',
                  overflow: 'hidden',
                  boxShadow: '0 10px 40px rgba(0,0,0,0.08)'
                }}>
                  <div style={{
                    background: 'linear-gradient(135deg, #dfa974 0%, #c89961 100%)',
                    padding: '25px',
                    color: 'white'
                  }}>
                    <div className="d-flex align-items-center justify-content-center">
                      <div style={{
                        width: '50px',
                        height: '50px',
                        background: 'rgba(255,255,255,0.2)',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: '15px'
                      }}>
                        <i className="fa fa-star" style={{ fontSize: '24px' }}></i>
                      </div>
                      <div>
                        <h4 className="mb-0" style={{ fontWeight: '700' }}>Dịch Vụ Premium</h4>
                        <small style={{ opacity: 0.9 }}>Trải nghiệm đẳng cấp 5 sao</small>
                      </div>
                    </div>
                  </div>
                  <div className="card-body" style={{ padding: '30px' }}>
                    <div className="row g-3">
                      <div className="col-md-6 col-lg-3">
                        <div style={{
                          border: additionalServices.airport_pickup ? '3px solid #dfa974' : '2px solid #e9ecef',
                          borderRadius: '16px',
                          padding: '20px',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          background: additionalServices.airport_pickup ? 'rgba(223, 169, 116, 0.1)' : 'white',
                          height: '100%'
                        }}
                        onClick={() => handlePremiumServiceClick('airport_pickup', additionalServices.airport_pickup)}
                        onMouseOver={(e) => {
                          if (!additionalServices.airport_pickup) {
                            e.currentTarget.style.borderColor = '#dfa974';
                            e.currentTarget.style.transform = 'translateY(-3px)';
                          }
                        }}
                        onMouseOut={(e) => {
                          if (!additionalServices.airport_pickup) {
                            e.currentTarget.style.borderColor = '#e9ecef';
                            e.currentTarget.style.transform = 'translateY(0)';
                          }
                        }}>
                          <div className="text-center mb-3">
                            <div style={{
                              width: '60px',
                              height: '60px',
                              background: 'linear-gradient(135deg, #dfa974 0%, #c89961 100%)',
                              borderRadius: '50%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              margin: '0 auto',
                              fontSize: '28px'
                            }}>
                              🚗
                            </div>
                          </div>
                          <h6 className="text-center mb-2" style={{ fontWeight: '700', color: '#2c3e50' }}>
                            Đưa đón sân bay
                          </h6>
                          <p className="text-center text-muted small mb-3">Xe sang đời mới, tài xế chuyên nghiệp</p>
                          <div className="text-center">
                            <strong style={{ color: '#dfa974', fontSize: '1.1rem' }}>500,000₫</strong>
                          </div>
                        </div>
                      </div>

                      <div className="col-md-6 col-lg-3">
                        <div style={{
                          border: additionalServices.spa ? '3px solid #2c3e50' : '2px solid #e9ecef',
                          borderRadius: '16px',
                          padding: '20px',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          background: additionalServices.spa ? 'rgba(44, 62, 80, 0.1)' : 'white',
                          height: '100%'
                        }}
                        onClick={() => handlePremiumServiceClick('spa', additionalServices.spa)}
                        onMouseOver={(e) => {
                          if (!additionalServices.spa) {
                            e.currentTarget.style.borderColor = '#4facfe';
                            e.currentTarget.style.transform = 'translateY(-3px)';
                          }
                        }}
                        onMouseOut={(e) => {
                          if (!additionalServices.spa) {
                            e.currentTarget.style.borderColor = '#e9ecef';
                            e.currentTarget.style.transform = 'translateY(0)';
                          }
                        }}>
                          <div className="text-center mb-3">
                            <div style={{
                              width: '60px',
                              height: '60px',
                              background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
                              borderRadius: '50%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              margin: '0 auto',
                              fontSize: '28px'
                            }}>
                              💆
                            </div>
                          </div>
                          <h6 className="text-center mb-2" style={{ fontWeight: '700', color: '#2c3e50' }}>
                            Dịch vụ Spa
                          </h6>
                          <p className="text-center text-muted small mb-3">Massage thư giãn 90 phút</p>
                          <div className="text-center">
                            <strong style={{ color: '#2c3e50', fontSize: '1.1rem' }}>800,000₫</strong>
                          </div>
                        </div>
                      </div>

                      <div className="col-md-6 col-lg-3">
                        <div style={{
                          border: additionalServices.laundry ? '3px solid #dfa974' : '2px solid #e9ecef',
                          borderRadius: '16px',
                          padding: '20px',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          background: additionalServices.laundry ? 'rgba(223, 169, 116, 0.1)' : 'white',
                          height: '100%'
                        }}
                        onClick={() => handlePremiumServiceClick('laundry', additionalServices.laundry)}
                        onMouseOver={(e) => {
                          if (!additionalServices.laundry) {
                            e.currentTarget.style.borderColor = '#11998e';
                            e.currentTarget.style.transform = 'translateY(-3px)';
                          }
                        }}
                        onMouseOut={(e) => {
                          if (!additionalServices.laundry) {
                            e.currentTarget.style.borderColor = '#e9ecef';
                            e.currentTarget.style.transform = 'translateY(0)';
                          }
                        }}>
                          <div className="text-center mb-3">
                            <div style={{
                              width: '60px',
                              height: '60px',
                              background: 'linear-gradient(135deg, #dfa974 0%, #c89961 100%)',
                              borderRadius: '50%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              margin: '0 auto',
                              fontSize: '28px'
                            }}>
                              👔
                            </div>
                          </div>
                          <h6 className="text-center mb-2" style={{ fontWeight: '700', color: '#2c3e50' }}>
                            Giặt ủi
                          </h6>
                          <p className="text-center text-muted small mb-3">Express trong 24h</p>
                          <div className="text-center">
                            <strong style={{ color: '#dfa974', fontSize: '1.1rem' }}>200,000₫</strong>
                          </div>
                        </div>
                      </div>

                      <div className="col-md-6 col-lg-3">
                        <div style={{
                          border: additionalServices.tour_guide ? '3px solid #2c3e50' : '2px solid #e9ecef',
                          borderRadius: '16px',
                          padding: '20px',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          background: additionalServices.tour_guide ? 'rgba(44, 62, 80, 0.1)' : 'white',
                          height: '100%'
                        }}
                        onClick={() => handlePremiumServiceClick('tour_guide', additionalServices.tour_guide)}
                        onMouseOver={(e) => {
                          if (!additionalServices.tour_guide) {
                            e.currentTarget.style.borderColor = '#f093fb';
                            e.currentTarget.style.transform = 'translateY(-3px)';
                          }
                        }}
                        onMouseOut={(e) => {
                          if (!additionalServices.tour_guide) {
                            e.currentTarget.style.borderColor = '#e9ecef';
                            e.currentTarget.style.transform = 'translateY(0)';
                          }
                        }}>
                          <div className="text-center mb-3">
                            <div style={{
                              width: '60px',
                              height: '60px',
                              background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
                              borderRadius: '50%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              margin: '0 auto',
                              fontSize: '28px'
                            }}>
                              🗺️
                            </div>
                          </div>
                          <h6 className="text-center mb-2" style={{ fontWeight: '700', color: '#2c3e50' }}>
                            Hướng dẫn viên
                          </h6>
                          <p className="text-center text-muted small mb-3">Du lịch chuyên nghiệp</p>
                          <div className="text-center">
                            <strong style={{ color: '#2c3e50', fontSize: '1.1rem' }}>1,200,000₫<small>/ngày</small></strong>
                          </div>
                        </div>
                      </div>
                    </div>

                    {(additionalServices.airport_pickup || additionalServices.spa || 
                      additionalServices.laundry || additionalServices.tour_guide) && (
                      <div style={{
                        background: 'linear-gradient(135deg, #dfa974 0%, #c89961 100%)',
                        padding: '20px',
                        borderRadius: '15px',
                        marginTop: '25px',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '15px'
                      }}>
                        <div style={{
                          width: '50px',
                          height: '50px',
                          background: 'rgba(255,255,255,0.2)',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}>
                          <i className="fa fa-bell" style={{ fontSize: '24px' }}></i>
                        </div>
                        <div>
                          <h6 className="mb-1" style={{ fontWeight: '700' }}>Thông báo quan trọng</h6>
                          <p className="mb-0" style={{ fontSize: '0.95rem', opacity: 0.95 }}>
                            Đội ngũ chăm sóc khách hàng sẽ liên hệ với bạn trong vòng <strong>30 phút</strong> để xác nhận các dịch vụ premium đã chọn.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {status === 'failed' && (
        <>
          <h2 className="text-danger">Thanh toán thất bại</h2>
          <p>{message}</p>
          <div className="mt-4">
            <button className="btn btn-secondary" onClick={() => navigate('/booking')}>Quay lại đặt phòng</button>
          </div>
        </>
      )}

      {/* Confirmation Modal for Premium Services */}
      {showPremiumConfirm && pendingServiceChange && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '20px',
            padding: '40px',
            maxWidth: '500px',
            width: '100%',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            animation: 'slideIn 0.3s ease'
          }}>
            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
              <div style={{
                width: '80px',
                height: '80px',
                background: 'linear-gradient(135deg, #dfa974 0%, #c89961 100%)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
                fontSize: '40px'
              }}>
                {pendingServiceChange.service === 'airport_pickup' && '🚗'}
                {pendingServiceChange.service === 'spa' && '💆'}
                {pendingServiceChange.service === 'laundry' && '👔'}
                {pendingServiceChange.service === 'tour_guide' && '🗺️'}
              </div>
              <h4 style={{ color: '#2c3e50', marginBottom: '15px', fontWeight: '700' }}>
                {pendingServiceChange.value ? 'Xác nhận đặt dịch vụ' : 'Hủy dịch vụ'}
              </h4>
              <p style={{ color: '#6c757d', fontSize: '1rem', lineHeight: '1.6' }}>
                {pendingServiceChange.value ? (
                  <>
                    Bạn có chắc chắn muốn đặt dịch vụ <strong>
                      {pendingServiceChange.service === 'airport_pickup' && 'Đưa đón sân bay'}
                      {pendingServiceChange.service === 'spa' && 'Spa'}
                      {pendingServiceChange.service === 'laundry' && 'Giặt ủi'}
                      {pendingServiceChange.service === 'tour_guide' && 'Hướng dẫn viên'}
                    </strong>?<br/><br/>
                    <span style={{ color: '#dfa974', fontWeight: '600' }}>
                      Đội ngũ chăm sóc khách hàng sẽ liên hệ với bạn trong vòng 30 phút để xác nhận.
                    </span>
                  </>
                ) : (
                  <>Bạn có chắc chắn muốn hủy dịch vụ này không?</>
                )}
              </p>
            </div>
            <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
              <button
                onClick={cancelPremiumService}
                style={{
                  padding: '12px 30px',
                  background: '#e9ecef',
                  border: 'none',
                  borderRadius: '10px',
                  color: '#6c757d',
                  fontWeight: '600',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  transition: 'all 0.3s ease'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = '#dee2e6';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = '#e9ecef';
                }}
              >
                Hủy
              </button>
              <button
                onClick={confirmPremiumService}
                style={{
                  padding: '12px 30px',
                  background: 'linear-gradient(135deg, #dfa974 0%, #c89961 100%)',
                  border: 'none',
                  borderRadius: '10px',
                  color: 'white',
                  fontWeight: '600',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 15px rgba(223, 169, 116, 0.3)'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(223, 169, 116, 0.4)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 15px rgba(223, 169, 116, 0.3)';
                }}
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentResult;
