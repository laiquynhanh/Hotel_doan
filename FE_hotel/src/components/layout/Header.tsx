import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import UserMenu from './UserMenu';

const Header = () => {
  const { isAuthenticated } = useAuth();

  return (
    <>
      {/* Header Section Begin */}
      <header className="header-section">
        <div className="top-nav">
          <div className="container">
            <div className="row">
              <div className="col-lg-6">
                <ul className="tn-left">
                  <li><i className="fa fa-phone"></i> (84) 123 456 789</li>
                  <li><i className="fa fa-envelope"></i> info.hotel@gmail.com</li>
                </ul>
              </div>
              <div className="col-lg-6">
                <div className="tn-right">
                  <div className="top-social">
                    <a href="#"><i className="fa fa-facebook"></i></a>
                    <a href="#"><i className="fa fa-twitter"></i></a>
                    <a href="#"><i className="fa fa-tripadvisor"></i></a>
                    <a href="#"><i className="fa fa-instagram"></i></a>
                  </div>
                  <Link to="/booking" className="bk-btn">Đặt Phòng Ngay</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="menu-item">
          <div className="container">
            <div className="row">
              <div className="col-lg-2">
                <div className="logo">
                  <Link to="/">
                    <img src="/img/logo.png" alt="Hotel Logo" />
                  </Link>
                </div>
              </div>
              <div className="col-lg-10">
                <div className="nav-menu">
                  <nav className="mainmenu">
                    <ul>
                      <li><Link to="/">Trang Chủ</Link></li>
                      <li><Link to="/rooms">Phòng</Link></li>
                      <li className="has-dropdown">
                        <Link to="/menu">Dịch Vụ</Link>
                        <ul className="dropdown">
                          <li><Link to="/menu">Thực Đơn</Link></li>
                          <li><Link to="/room-service">Đặt Món</Link></li>
                          <li><Link to="/restaurant-booking">Đặt Bàn</Link></li>
                          {isAuthenticated && (
                            <>
                              <li><Link to="/my-food-orders">Đơn Hàng Của Tôi</Link></li>
                              <li><Link to="/my-reservations">Đặt Bàn Của Tôi</Link></li>
                            </>
                          )}
                        </ul>
                      </li>
                      <li><Link to="/about">Về Chúng Tôi</Link></li>
                      <li><Link to="/blog">Tin Tức</Link></li>
                      <li><Link to="/contact">Liên Hệ</Link></li>
                      <li>
                        {isAuthenticated ? (
                          <UserMenu />
                        ) : (
                          <Link to="/login">Đăng Nhập</Link>
                        )}
                      </li>
                    </ul>
                  </nav>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>
      {/* Header End */}
    </>
  );
};

export default Header;
