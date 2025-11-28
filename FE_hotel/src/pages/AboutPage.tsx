import { Link } from 'react-router-dom';

const AboutPage = () => {
  return (
    <>
      {/* Breadcrumb Section Begin */}
      <div className="breadcrumb-section">
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <div className="breadcrumb-text">
                <h2>Về Chúng Tôi</h2>
                <div className="bt-option">
                  <Link to="/">Trang Chủ</Link>
                  <span>Về Chúng Tôi</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Breadcrumb Section End */}

      {/* About Us Page Section Begin */}
      <section className="aboutus-page-section spad">
        <div className="container">
          <div className="about-page-text">
            <div className="row">
              <div className="col-lg-6">
                <div className="ap-title">
                  <h2>Chào Mừng Đến Với Sona.</h2>
                  <p>Được xây dựng vào năm 1910 trong thời kỳ Belle Epoque, khách sạn này tọa lạc tại trung tâm
                    thành phố, với lối đi dễ dàng đến các điểm tham quan du lịch. Chúng tôi cung cấp các phòng
                    được trang trí tao nhã.</p>
                </div>
              </div>
              <div className="col-lg-5 offset-lg-1">
                <ul className="ap-services">
                  <li><i className="icon_check"></i> Giảm 20% Chi Phí Lưu Trú.</li>
                  <li><i className="icon_check"></i> Bữa Sáng Miễn Phí Hàng Ngày</li>
                  <li><i className="icon_check"></i> 3 Lượt Giặt Ủi Mỗi Ngày</li>
                  <li><i className="icon_check"></i> Wifi Miễn Phí.</li>
                  <li><i className="icon_check"></i> Giảm Giá 20% Ẩm Thực</li>
                </ul>
              </div>
            </div>
          </div>
          <div className="about-page-services">
            <div className="row">
              <div className="col-md-4">
                <div 
                  className="ap-service-item set-bg" 
                  style={{ backgroundImage: 'url(/img/about/about-p1.jpg)' }}
                >
                  <div className="api-text">
                    <h3>Dịch Vụ Nhà Hàng</h3>
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div 
                  className="ap-service-item set-bg" 
                  style={{ backgroundImage: 'url(/img/about/about-p2.jpg)' }}
                >
                  <div className="api-text">
                    <h3>Du Lịch & Cắm Trại</h3>
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div 
                  className="ap-service-item set-bg" 
                  style={{ backgroundImage: 'url(/img/about/about-p3.jpg)' }}
                >
                  <div className="api-text">
                    <h3>Sự Kiện & Tiệc</h3>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* About Us Page Section End */}

      {/* Video Section Begin */}
      <section 
        className="video-section set-bg" 
        style={{ backgroundImage: 'url(/img/video-bg.jpg)' }}
      >
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <div className="video-text">
                <h2>Khám Phá Khách Sạn & Dịch Vụ Của Chúng Tôi.</h2>
                <p>Trải Nghiệm Tuyệt Vời Tại Khách Sạn Cao Cấp Của Chúng Tôi</p>
                <a href="https://www.youtube.com/watch?v=EzKkl64rRbM" className="play-btn video-popup">
                  <img src="/img/play.png" alt="" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Video Section End */}

      {/* Gallery Section Begin */}
      <section className="gallery-section spad">
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <div className="section-title">
                <span>Hình Ảnh Của Chúng Tôi</span>
                <h2>Khám Phá Khách Sạn Của Chúng Tôi</h2>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-lg-6">
              <div 
                className="gallery-item set-bg" 
                style={{ backgroundImage: 'url(/img/gallery/gallery-1.jpg)' }}
              >
                <a href="/img/gallery/gallery-1.jpg" className="ti-plus"></a>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="row">
                <div className="col-sm-6">
                  <div 
                    className="gallery-item set-bg" 
                    style={{ backgroundImage: 'url(/img/gallery/gallery-3.jpg)' }}
                  >
                    <a href="/img/gallery/gallery-3.jpg" className="ti-plus"></a>
                  </div>
                </div>
                <div className="col-sm-6">
                  <div 
                    className="gallery-item set-bg" 
                    style={{ backgroundImage: 'url(/img/gallery/gallery-4.jpg)' }}
                  >
                    <a href="/img/gallery/gallery-4.jpg" className="ti-plus"></a>
                  </div>
                </div>
                <div className="col-lg-12">
                  <div 
                    className="gallery-item large-item set-bg" 
                    style={{ backgroundImage: 'url(/img/gallery/gallery-2.jpg)' }}
                  >
                    <a href="/img/gallery/gallery-2.jpg" className="ti-plus"></a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Gallery Section End */}
    </>
  );
};

export default AboutPage;
