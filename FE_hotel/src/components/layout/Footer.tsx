import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="footer-section">
      <div className="container">
        <div className="footer-text">
          <div className="row">
            <div className="col-lg-4">
              <div className="ft-about">
                <div className="logo">
                  <Link to="/">
                    <img src="/img/footer-logo.png" alt="" />
                  </Link>
                </div>
                <p>Chúng tôi truyền cảm hứng và tiếp cận hàng triệu du khách<br /> trên 90 trang web địa phương</p>
                <div className="fa-social">
                  <a href="#"><i className="fa fa-facebook"></i></a>
                  <a href="#"><i className="fa fa-twitter"></i></a>
                  <a href="#"><i className="fa fa-tripadvisor"></i></a>
                  <a href="#"><i className="fa fa-instagram"></i></a>
                  <a href="#"><i className="fa fa-youtube-play"></i></a>
                </div>
              </div>
            </div>
            <div className="col-lg-3 offset-lg-1">
              <div className="ft-contact">
                <h6>Liên Hệ</h6>
                <ul>
                  <li>(84) 123 456 789</li>
                  <li>info.hotel@gmail.com</li>
                  <li>123 Đường Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh</li>
                </ul>
              </div>
            </div>
            <div className="col-lg-3 offset-lg-1">
              <div className="ft-newslatter">
                <h6>Tin Mới Nhất</h6>
                <p>Nhận cập nhật và ưu đãi mới nhất.</p>
                <form action="#" className="fn-form">
                  <input type="text" placeholder="Email" />
                  <button type="submit"><i className="fa fa-send"></i></button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="copyright-option">
        <div className="container">
          <div className="row">
            <div className="col-lg-7">
              <ul>
                <li><Link to="/contact">Liên Hệ</Link></li>
                <li><Link to="/terms">Điều Khoản Sử Dụng</Link></li>
                <li><Link to="/privacy">Chính Sách Bảo Mật</Link></li>
              </ul>
            </div>
            <div className="col-lg-5">
              <div className="co-text"><p>
                Bản quyền &copy; {new Date().getFullYear()} Đã đăng ký bản quyền
              </p></div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
