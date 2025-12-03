import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import '../styles/AdditionalServicesPage.css';

const AdditionalServicesPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const bookingId = searchParams.get('bookingId');
  const [showServices, setShowServices] = useState(false);

  useEffect(() => {
    // Nếu không có bookingId, redirect về home
    if (!bookingId) {
      navigate('/');
    }
  }, [bookingId, navigate]);

  const handleConfirm = () => {
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
                  onClick={() => navigate('/room-service')}
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
                  onClick={() => navigate('/restaurant-booking')}
                >
                  Đặt bàn
                </button>
              </div>

              <div className="service-item">
                <div className="service-icon">✈️</div>
                <div className="service-info">
                  <h4>Đưa đón sân bay</h4>
                  <p>Dịch vụ đưa đón tận nơi, tiện lợi và an toàn</p>
                </div>
                <div className="service-badge">Liên hệ lễ tân</div>
              </div>

              <div className="service-item">
                <div className="service-icon">💆</div>
                <div className="service-info">
                  <h4>Dịch vụ Spa</h4>
                  <p>Thư giãn với các liệu trình chăm sóc chuyên nghiệp</p>
                </div>
                <div className="service-badge">Liên hệ lễ tân</div>
              </div>

              <div className="service-item">
                <div className="service-icon">🧺</div>
                <div className="service-info">
                  <h4>Giặt ủi</h4>
                  <p>Dịch vụ giặt ủi nhanh chóng, chất lượng cao</p>
                </div>
                <div className="service-badge">Liên hệ lễ tân</div>
              </div>

              <div className="service-item">
                <div className="service-icon">🗺️</div>
                <div className="service-info">
                  <h4>Hướng dẫn viên du lịch</h4>
                  <p>Khám phá thành phố cùng hướng dẫn viên địa phương</p>
                </div>
                <div className="service-badge">Liên hệ lễ tân</div>
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
    </div>
  );
};

export default AdditionalServicesPage;
