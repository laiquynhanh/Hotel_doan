import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/HomePage.css';

const HomePage = () => {
  const navigate = useNavigate();
  const [checkInDate, setCheckInDate] = useState<string>('');
  const [checkOutDate, setCheckOutDate] = useState<string>('');
  const dateInRef = useRef<HTMLInputElement | null>(null);
  const dateOutRef = useRef<HTMLInputElement | null>(null);

  const formatToIso = (val: string) => {
    // Accepts dd-mm-yy or dd-mm-yyyy and returns yyyy-mm-dd; if already yyyy-mm-dd, return as-is
    if (!val) return '';
    // already ISO
    if (/^\d{4}-\d{2}-\d{2}$/.test(val)) return val;
    const m = val.match(/^(\d{2})-(\d{2})-(\d{2,4})$/);
    if (!m) return val;
    let [_, d, mo, y] = m;
    if (y.length === 2) y = '20' + y; // assume 20xx
    return `${y}-${mo}-${d}`;
  };

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const dateInEl = document.getElementById('date-in') as HTMLInputElement | null;
    const dateOutEl = document.getElementById('date-out') as HTMLInputElement | null;
    const guestEl = document.getElementById('guest') as HTMLSelectElement | null;
    const roomEl = document.getElementById('room') as HTMLSelectElement | null;

    const rawIn = dateInEl?.value || '';
    const rawOut = dateOutEl?.value || '';
    const guest = guestEl?.value || '';
    const rooms = roomEl?.value || '';

    const checkInDate = formatToIso(rawIn);
    const checkOutDate = formatToIso(rawOut);

    const params = new URLSearchParams();
    if (checkInDate) params.append('checkInDate', checkInDate);
    if (checkOutDate) params.append('checkOutDate', checkOutDate);
    if (guest) params.append('minCapacity', guest);
    if (rooms) params.append('rooms', rooms);

    navigate(`/search-rooms?${params.toString()}`);
  };

  useEffect(() => {
    // Initialize jQuery plugins after component mounts
    if (typeof window !== 'undefined' && (window as any).$) {
      const $ = (window as any).$;
      
      // Initialize hero slider (owl-carousel)
      if ($.fn.owlCarousel) {
        const $hero = $('.hero-slider');
        if ($hero.length) {
          $hero.owlCarousel({
            loop: true,
            margin: 0,
            items: 1,
            dots: true,
            nav: true,
            navText: ['<span class="arrow_left"></span>', '<span class="arrow_right"></span>'],
            smartSpeed: 1200,
            autoHeight: false,
            autoplay: true,
            autoplayTimeout: 5000,
            animateOut: 'fadeOut',
            animateIn: 'fadeIn',
          });
        }
      }

      // Initialize date picker
      $('.date-input').datepicker({
        dateFormat: 'dd-mm-yy',
        minDate: 0
      });
      
      // Initialize nice select
      if ($.fn.niceSelect) {
        $('select').niceSelect();
      }
      
      // Initialize owl carousel for testimonials
      if ($.fn.owlCarousel) {
        $('.testimonial-slider').owlCarousel({
          loop: true,
          margin: 0,
          items: 1,
          dots: true,
          nav: false,
          autoplay: true,
          autoplayTimeout: 5000,
          smartSpeed: 1200,
        });
      }
    }
  }, []);

  return (
    <>
      {/* Hero Section Begin */}
      <section className="hero-section">
        {/* Background slider (absolute, full section) */}
        <div className="hero-slider owl-carousel">
          <div className="hs-item set-bg" style={{ backgroundImage: 'url(/img/hero/hero-1.jpg)' }}></div>
          <div className="hs-item set-bg" style={{ backgroundImage: 'url(/img/hero/hero-2.jpg)' }}></div>
          <div className="hs-item set-bg" style={{ backgroundImage: 'url(/img/hero/hero-3.jpg)' }}></div>
        </div>

        {/* Foreground content overlay (matches Sona structure) */}
        <div className="container">
          <div className="row">
            <div className="col-lg-6">
              <div className="hero-text">
                <h1>Sona Khách Sạn Sang Trọng</h1>
                <p>Những trang web đặt phòng tốt nhất cho cả du lịch quốc tế và trong nước, giúp bạn tìm phòng với giá tốt nhất.</p>
                <a href="#rooms" className="primary-btn">Khám Phá Ngay</a>
              </div>
            </div>
            <div className="col-xl-4 col-lg-5 offset-xl-2 offset-lg-1">
              <div className="booking-form">
                <h3>Đặt Phòng Của Bạn</h3>
                <form onSubmit={handleBookingSubmit}>
                  <div className="check-date">
                    <label htmlFor="date-in">Ngày Nhận Phòng:</label>
                    <input 
                      ref={dateInRef}
                      type="date" 
                      className="form-control" 
                      id="date-in"
                      value={checkInDate}
                      onChange={(e) => {
                        setCheckInDate(e.target.value);
                        if (checkOutDate && e.target.value && checkOutDate < e.target.value) {
                          setCheckOutDate(e.target.value);
                        }
                      }}
                      min={new Date().toISOString().split('T')[0]}
                      required
                    />
                    <i 
                      className="icon_calendar" 
                      onClick={() => {
                        const el = dateInRef.current;
                        if (!el) return;
                        // @ts-ignore
                        if (typeof el.showPicker === 'function') {
                          // @ts-ignore
                          el.showPicker();
                        } else {
                          el.focus();
                          el.click();
                        }
                      }}
                    ></i>
                  </div>
                  <div className="check-date">
                    <label htmlFor="date-out">Ngày Trả Phòng:</label>
                    <input 
                      ref={dateOutRef}
                      type="date" 
                      className="form-control" 
                      id="date-out"
                      value={checkOutDate}
                      onChange={(e) => setCheckOutDate(e.target.value)}
                      min={checkInDate || new Date().toISOString().split('T')[0]}
                      required
                    />
                    <i 
                      className="icon_calendar" 
                      onClick={() => {
                        const el = dateOutRef.current;
                        if (!el) return;
                        // @ts-ignore
                        if (typeof el.showPicker === 'function') {
                          // @ts-ignore
                          el.showPicker();
                        } else {
                          el.focus();
                          el.click();
                        }
                      }}
                    ></i>
                  </div>
                  <div className="select-option">
                    <label htmlFor="guest">Khách:</label>
                    <select id="guest">
                      <option value="2">2 Người Lớn</option>
                      <option value="3">3 Người Lớn</option>
                    </select>
                  </div>
                  <div className="select-option">
                    <label htmlFor="room">Phòng:</label>
                    <select id="room">
                      <option value="1">1 Phòng</option>
                      <option value="2">2 Phòng</option>
                    </select>
                  </div>
                  <button type="submit">Kiểm Tra Phòng Trống</button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Hero Section End */}

      {/* About Us Section Begin */}
      <section className="aboutus-section spad">
        <div className="container">
          <div className="row">
            <div className="col-lg-6">
              <div className="about-text">
                <div className="section-title">
                  <span>Về Chúng Tôi</span>
                  <h2>Khách Sạn Intercontinental <br />LA Westlake</h2>
                </div>
                <p className="f-para">Sona.com là trang web đặt chỗ trực tuyến hàng đầu. Chúng tôi đam mê
                  du lịch. Mỗi ngày, chúng tôi truyền cảm hứng và tiếp cận hàng triệu du khách trên 90 trang web địa phương bằng 41
                  ngôn ngữ.</p>
                <p className="s-para">Vì vậy, khi đặt khách sạn, khu nghỉ dưỡng, căn hộ, nhà khách hoàn hảo,
                  chúng tôi sẽ hỗ trợ bạn.</p>
                <a href="/about" className="primary-btn about-btn">Đọc Thêm</a>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="about-pic">
                <div className="row">
                  <div className="col-sm-6">
                    <img src="/img/about/about-1.jpg" alt="" />
                  </div>
                  <div className="col-sm-6">
                    <img src="/img/about/about-2.jpg" alt="" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Services Section End */}
      <section className="services-section spad" id="services">
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <div className="section-title">
                <span>Chúng Tôi Làm Gì</span>
                <h2>Khám Phá Dịch Vụ Của Chúng Tôi</h2>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-lg-4 col-sm-6">
              <div className="service-item">
                <i className="flaticon-036-parking"></i>
                <h4>Lập Kế Hoạch Du Lịch</h4>
                <p>Chúng tôi hỗ trợ bạn lập kế hoạch du lịch hoàn hảo với các dịch vụ tư vấn chuyên nghiệp và
                  kinh nghiệm lâu năm.</p>
              </div>
            </div>
            <div className="col-lg-4 col-sm-6">
              <div className="service-item">
                <i className="flaticon-033-dinner"></i>
                <h4>Dịch Vụ Ẩm Thực</h4>
                <p>Thưởng thức các món ăn ngon với dịch vụ phục vụ tận phòng 24/7 và nhà hàng cao cấp tại
                  khách sạn.</p>
              </div>
            </div>
            <div className="col-lg-4 col-sm-6">
              <div className="service-item">
                <i className="flaticon-026-bed"></i>
                <h4>Trông Trẻ</h4>
                <p>Dịch vụ trông trẻ chuyên nghiệp giúp bạn yên tâm thư giãn trong khi con bạn được chăm sóc
                  tận tình.</p>
              </div>
            </div>
            <div className="col-lg-4 col-sm-6">
              <div className="service-item">
                <i className="flaticon-024-towel"></i>
                <h4>Giặt Ủi</h4>
                <p>Dịch vụ giặt ủi nhanh chóng, chuyên nghiệp đảm bảo quần áo của bạn luôn sạch sẽ và
                  thơm tho.</p>
              </div>
            </div>
            <div className="col-lg-4 col-sm-6">
              <div className="service-item">
                <i className="flaticon-044-clock-1"></i>
                <h4>Thuê Tài Xế</h4>
                <p>Dịch vụ cho thuê tài xế riêng giúp bạn di chuyển an toàn và tiện lợi khắp thành phố.</p>
              </div>
            </div>
            <div className="col-lg-4 col-sm-6">
              <div className="service-item">
                <i className="flaticon-012-cocktail"></i>
                <h4>Bar & Đồ Uống</h4>
                <p>Thư giãn tại quầy bar với các loại cocktail và đồ uống cao cấp được pha chế bởi bartender
                  chuyên nghiệp.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Services Section End */}

      {/* Home Room Section Begin */}
      <section className="hp-room-section" id="rooms">
        <div className="container-fluid">
          <div className="hp-room-items">
            <div className="row">
              <div className="col-lg-3 col-md-6">
                <div
                  className="hp-room-item set-bg"
                  style={{ backgroundImage: 'url(/img/room/room-b1.jpg)' }}
                >
                  <div className="hr-text">
                    <h3>Phòng Đôi</h3>
                    <h2>4.975.000₫<span>/Đêm</span></h2>
                    <table>
                      <thead>
                        <tr>
                          <th>Thông Số</th>
                          <th>Giá Trị</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="r-o">Diện Tích:</td>
                          <td>30 m²</td>
                        </tr>
                        <tr>
                          <td className="r-o">Sức Chứa:</td>
                          <td>Tối đa 5 người</td>
                        </tr>
                        <tr>
                          <td className="r-o">Giường:</td>
                          <td>Giường Đôi</td>
                        </tr>
                        <tr>
                          <td className="r-o">Dịch Vụ:</td>
                          <td>Wifi, TV, Phòng Tắm,...</td>
                        </tr>
                      </tbody>
                    </table>
                    <a href="/rooms?type=DOUBLE" className="primary-btn">Chi Tiết</a>
                  </div>
                </div>
              </div>
              <div className="col-lg-3 col-md-6">
                <div
                  className="hp-room-item set-bg"
                  style={{ backgroundImage: 'url(/img/room/room-b2.jpg)' }}
                >
                  <div className="hr-text">
                    <h3>Phòng King Cao Cấp</h3>
                    <h2>3.975.000₫<span>/Đêm</span></h2>
                    <table>
                      <thead>
                        <tr>
                          <th>Thông Số</th>
                          <th>Giá Trị</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="r-o">Diện Tích:</td>
                          <td>30 m²</td>
                        </tr>
                        <tr>
                          <td className="r-o">Sức Chứa:</td>
                          <td>Tối đa 5 người</td>
                        </tr>
                        <tr>
                          <td className="r-o">Giường:</td>
                          <td>Giường King</td>
                        </tr>
                        <tr>
                          <td className="r-o">Dịch Vụ:</td>
                          <td>Wifi, TV, Phòng Tắm,...</td>
                        </tr>
                      </tbody>
                    </table>
                    <a href="/rooms?type=PREMIUM" className="primary-btn">Chi Tiết</a>
                  </div>
                </div>
              </div>
              <div className="col-lg-3 col-md-6">
                <div
                  className="hp-room-item set-bg"
                  style={{ backgroundImage: 'url(/img/room/room-b3.jpg)' }}
                >
                  <div className="hr-text">
                    <h3>Phòng Deluxe</h3>
                    <h2>4.950.000₫<span>/Đêm</span></h2>
                    <table>
                      <thead>
                        <tr>
                          <th>Thông Số</th>
                          <th>Giá Trị</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="r-o">Diện Tích:</td>
                          <td>30 m²</td>
                        </tr>
                        <tr>
                          <td className="r-o">Sức Chứa:</td>
                          <td>Tối đa 5 người</td>
                        </tr>
                        <tr>
                          <td className="r-o">Giường:</td>
                          <td>Giường King</td>
                        </tr>
                        <tr>
                          <td className="r-o">Dịch Vụ:</td>
                          <td>Wifi, TV, Phòng Tắm,...</td>
                        </tr>
                      </tbody>
                    </table>
                    <a href="/rooms?type=DELUXE" className="primary-btn">Chi Tiết</a>
                  </div>
                </div>
              </div>
              <div className="col-lg-3 col-md-6">
                <div
                  className="hp-room-item set-bg"
                  style={{ backgroundImage: 'url(/img/room/room-b4.jpg)' }}
                >
                  <div className="hr-text">
                    <h3>Phòng Gia Đình</h3>
                    <h2>7.475.000₫<span>/Đêm</span></h2>
                    <table>
                      <thead>
                        <tr>
                          <th>Thông Số</th>
                          <th>Giá Trị</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="r-o">Diện Tích:</td>
                          <td>30 m²</td>
                        </tr>
                        <tr>
                          <td className="r-o">Sức Chứa:</td>
                          <td>Tối đa 5 người</td>
                        </tr>
                        <tr>
                          <td className="r-o">Giường:</td>
                          <td>Giường King</td>
                        </tr>
                        <tr>
                          <td className="r-o">Dịch Vụ:</td>
                          <td>Wifi, TV, Phòng Tắm,...</td>
                        </tr>
                      </tbody>
                    </table>
                    <a href="/rooms?type=FAMILY" className="primary-btn">Chi Tiết</a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Home Room Section End */}

      {/* Testimonial Section Begin */}
      <section className="testimonial-section spad">
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <div className="section-title">
                <span>Đánh Giá</span>
                <h2>Khách Hàng Nói Gì?</h2>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-lg-8 offset-lg-2">
              <div className="testimonial-slider owl-carousel">
                <div className="ts-item">
                  <p>Sau khi một dự án xây dựng kéo dài lâu hơn dự kiến, tôi, chồng tôi và con gái tôi
                    cần một nơi để ở trong vài đêm. Là cư dân Sài Gòn, chúng tôi biết rất nhiều về thành phố,
                    khu phố và các lựa chọn nhà ở có sẵn và hoàn toàn yêu thích kỳ nghỉ của chúng tôi tại Khách Sạn Sona.</p>
                  <div className="ti-author">
                    <div className="rating">
                      <i className="icon_star"></i>
                      <i className="icon_star"></i>
                      <i className="icon_star"></i>
                      <i className="icon_star"></i>
                      <i className="icon_star-half_alt"></i>
                    </div>
                    <h5> - Nguyễn Văn A</h5>
                  </div>
                  <img src="/img/testimonial-logo.png" alt="" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Testimonial Section End */}
    </>
  );
};

export default HomePage;