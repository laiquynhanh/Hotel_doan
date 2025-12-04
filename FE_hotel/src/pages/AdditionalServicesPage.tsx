import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import '../styles/AdditionalServicesPage.css';

interface SelectedService {
  airport: boolean;
  spa: boolean;
  laundry: boolean;
  tourGuide: boolean;
}

const AdditionalServicesPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const bookingId = searchParams.get('bookingId');
  const [showServices, setShowServices] = useState(false);
  const [showContinueModal, setShowContinueModal] = useState(false);
  const [selectedServices, setSelectedServices] = useState<SelectedService>({
    airport: false,
    spa: false,
    laundry: false,
    tourGuide: false
  });

  useEffect(() => {
    // Nếu không có bookingId, redirect về home
    if (!bookingId) {
      navigate('/');
    }
  }, [bookingId, navigate]);

  const toggleService = (service: keyof SelectedService) => {
    setSelectedServices(prev => ({
      ...prev,
      [service]: !prev[service]
    }));
  };

  const handleConfirm = () => {
    // Lưu các dịch vụ đã chọn vào localStorage hoặc gửi lên server
    if (Object.values(selectedServices).some(v => v)) {
      localStorage.setItem(`booking_${bookingId}_services`, JSON.stringify(selectedServices));
      alert('Đã ghi nhận yêu cầu dịch vụ của bạn!\nLễ tân sẽ liên hệ với bạn sớm nhất.');
    }
    navigate('/my-bookings');
  };

  const handleSkip = () => {
    navigate('/my-bookings');
  };

  return (
    <div className="additional-services-page">
      <div className="container">
        <div className="services-card">
          <div className="success-icon">
            <i className="fa fa-check-circle"></i>
          </div>
          
          <h2>Đặt Phòng Thành Công!</h2>
          <p className="booking-id">Mã đặt phòng: #{bookingId}</p>
          
          <div className="services-question">
            <h3>Bạn có muốn trải nghiệm thêm dịch vụ không?</h3>
            <p>Chúng tôi có các dịch vụ bổ sung để làm cho kỳ nghỉ của bạn trọn vẹn hơn</p>
          </div>

          <div className="services-options">
            <button 
              className="btn-view-services"
              onClick={() => setShowServices(!showServices)}
            >
              <i className="fa fa-list"></i>
              {showServices ? 'Ẩn dịch vụ' : 'Xem các dịch vụ có sẵn'}
            </button>
          </div>

          {showServices && (
            <div className="services-list">
              <div className="service-item">
                <div className="service-icon">🍽️</div>
                <div className="service-info">
                  <h4>Room Service - Gọi đồ ăn về phòng</h4>
                  <p>Thưởng thức các món ăn ngon ngay tại phòng của bạn</p>
                </div>
                <button 
                  className="btn-order"
                  onClick={() => {
                    localStorage.setItem('returnToAdditionalServices', 'true');
                    localStorage.setItem('currentBookingId', bookingId || '');
                    navigate('/room-service');
                  }}
                >
                  Đặt ngay
                </button>
              </div>

              <div className="service-item">
                <div className="service-icon">🍴</div>
                <div className="service-info">
                  <h4>Đặt bàn nhà hàng</h4>
                  <p>Đặt trước bàn tại nhà hàng sang trọng của khách sạn</p>
                </div>
                <button 
                  className="btn-order"
                  onClick={() => {
                    localStorage.setItem('returnToAdditionalServices', 'true');
                    localStorage.setItem('currentBookingId', bookingId || '');
                    navigate('/restaurant-booking');
                  }}
                >
                  Đặt bàn
                </button>
              </div>

              <div 
                className={`service-item selectable ${selectedServices.airport ? 'selected' : ''}`}
                onClick={() => toggleService('airport')}
              >
                <div className="service-icon">✈️</div>
                <div className="service-info">
                  <h4>Đưa đón sân bay</h4>
                  <p>Dịch vụ đưa đón tận nơi, tiện lợi và an toàn</p>
                </div>
                <div className="service-checkbox">
                  {selectedServices.airport ? (
                    <i className="fa fa-check-circle"></i>
                  ) : (
                    <i className="fa fa-circle-o"></i>
                  )}
                </div>
              </div>

              <div 
                className={`service-item selectable ${selectedServices.spa ? 'selected' : ''}`}
                onClick={() => toggleService('spa')}
              >
                <div className="service-icon">💆</div>
                <div className="service-info">
                  <h4>Dịch vụ Spa</h4>
                  <p>Thư giãn với các liệu trình chăm sóc chuyên nghiệp</p>
                </div>
                <div className="service-checkbox">
                  {selectedServices.spa ? (
                    <i className="fa fa-check-circle"></i>
                  ) : (
                    <i className="fa fa-circle-o"></i>
                  )}
                </div>
              </div>

              <div 
                className={`service-item selectable ${selectedServices.laundry ? 'selected' : ''}`}
                onClick={() => toggleService('laundry')}
              >
                <div className="service-icon">🧺</div>
                <div className="service-info">
                  <h4>Giặt ủi</h4>
                  <p>Dịch vụ giặt ủi nhanh chóng, chất lượng cao</p>
                </div>
                <div className="service-checkbox">
                  {selectedServices.laundry ? (
                    <i className="fa fa-check-circle"></i>
                  ) : (
                    <i className="fa fa-circle-o"></i>
                  )}
                </div>
              </div>

              <div 
                className={`service-item selectable ${selectedServices.tourGuide ? 'selected' : ''}`}
                onClick={() => toggleService('tourGuide')}
              >
                <div className="service-icon">🗺️</div>
                <div className="service-info">
                  <h4>Hướng dẫn viên du lịch</h4>
                  <p>Khám phá thành phố cùng hướng dẫn viên địa phương</p>
                </div>
                <div className="service-checkbox">
                  {selectedServices.tourGuide ? (
                    <i className="fa fa-check-circle"></i>
                  ) : (
                    <i className="fa fa-circle-o"></i>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="action-buttons">
            <button 
              className="btn-skip"
              onClick={handleSkip}
            >
              Bỏ qua
            </button>
            <button 
              className="btn-confirm"
              onClick={handleConfirm}
            >
              Xác nhận & Xem đặt phòng
            </button>
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
                  setShowContinueModal(false);
                  setShowServices(true);
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

export default AdditionalServicesPage;
