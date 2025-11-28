import { Link } from 'react-router-dom';

const BlogPage = () => {
  const blogPosts = [
    {
      id: 1,
      title: 'Sona.com Được Vinh Danh "Trang Web Đặt Phòng Tốt Nhất"',
      date: '27/08/2019',
      image: '/img/blog/blog-1.jpg',
      excerpt: 'Khách sạn Sona vừa nhận giải thưởng danh giá từ hiệp hội du lịch quốc tế...',
    },
    {
      id: 2,
      title: '5 Lý Do Nên Chọn Sona Cho Kỳ Nghỉ Của Bạn',
      date: '27/08/2019',
      image: '/img/blog/blog-2.jpg',
      excerpt: 'Với vị trí đắc địa và dịch vụ hoàn hảo, Sona là lựa chọn hàng đầu...',
    },
    {
      id: 3,
      title: 'Khám Phá Ẩm Thực Tại Nhà Hàng Của Chúng Tôi',
      date: '27/08/2019',
      image: '/img/blog/blog-3.jpg',
      excerpt: 'Nhà hàng Sona mang đến trải nghiệm ẩm thực đẳng cấp với các món ăn...',
    },
    {
      id: 4,
      title: 'Dịch Vụ Spa & Wellness Cao Cấp',
      date: '27/08/2019',
      image: '/img/blog/blog-4.jpg',
      excerpt: 'Thư giãn hoàn toàn với các liệu trình spa chuyên nghiệp...',
    },
    {
      id: 5,
      title: 'Tổ Chức Sự Kiện & Hội Nghị Tại Sona',
      date: '27/08/2019',
      image: '/img/blog/blog-5.jpg',
      excerpt: 'Hội trường hiện đại với đầy đủ trang thiết bị phục vụ mọi sự kiện...',
    },
    {
      id: 6,
      title: 'Ưu Đãi Đặc Biệt Mùa Hè 2025',
      date: '27/08/2019',
      image: '/img/blog/blog-6.jpg',
      excerpt: 'Giảm giá lên đến 30% cho các đặt phòng trong mùa hè này...',
    },
  ];

  return (
    <>
      {/* Breadcrumb Section Begin */}
      <div className="breadcrumb-section">
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <div className="breadcrumb-text">
                <h2>Tin Tức Của Chúng Tôi</h2>
                <div className="bt-option">
                  <Link to="/">Trang Chủ</Link>
                  <span>Tin Tức</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Breadcrumb Section End */}

      {/* Blog Section Begin */}
      <section className="blog-section spad">
        <div className="container">
          <div className="row">
            <div className="col-lg-8">
              <div className="row">
                {blogPosts.map((post) => (
                  <div key={post.id} className="col-lg-6 col-md-6">
                    <div className="blog-item">
                      <img src={post.image} alt={post.title} />
                      <div className="bi-text">
                        <span className="b-tag">Du Lịch</span>
                        <h4>
                          <Link to={`/blog/${post.id}`}>{post.title}</Link>
                        </h4>
                        <div className="b-time">
                          <i className="icon_clock_alt"></i> {post.date}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="col-lg-12">
                <div className="blog-pagination">
                  <a href="#" className="active">1</a>
                  <a href="#">2</a>
                  <a href="#">3</a>
                  <a href="#">Tiếp <i className="fa fa-long-arrow-right"></i></a>
                </div>
              </div>
            </div>
            <div className="col-lg-4">
              <div className="blog-sidebar">
                <div className="bs-widget">
                  <div className="bsw-title">
                    <h5>Tìm Kiếm</h5>
                  </div>
                  <div className="search-form">
                    <form action="#">
                      <input type="text" placeholder="Tìm kiếm..." />
                      <button type="submit"><i className="fa fa-search"></i></button>
                    </form>
                  </div>
                </div>
                <div className="bs-widget">
                  <div className="bsw-title">
                    <h5>Danh Mục</h5>
                  </div>
                  <div className="tags-list">
                    <Link to="#">Khách Sạn</Link>
                    <Link to="#">Phòng</Link>
                    <Link to="#">Sự Kiện</Link>
                    <Link to="#">Ẩm Thực</Link>
                    <Link to="#">Du Lịch</Link>
                    <Link to="#">Ưu Đãi</Link>
                  </div>
                </div>
                <div className="bs-widget">
                  <div className="bsw-title">
                    <h5>Bài Viết Gần Đây</h5>
                  </div>
                  <div className="recent-post">
                    <div className="rp-item">
                      <img src="/img/blog/blog-7.jpg" alt="" />
                      <div className="rp-text">
                        <h6>
                          <Link to="/blog/1">Top 10 Khách Sạn Tốt Nhất Năm 2025</Link>
                        </h6>
                        <span className="rp-date">27/08/2019</span>
                      </div>
                    </div>
                    <div className="rp-item">
                      <img src="/img/blog/blog-8.jpg" alt="" />
                      <div className="rp-text">
                        <h6>
                          <Link to="/blog/2">Bí Quyết Đặt Phòng Khách Sạn Giá Rẻ</Link>
                        </h6>
                        <span className="rp-date">27/08/2019</span>
                      </div>
                    </div>
                    <div className="rp-item">
                      <img src="/img/blog/blog-9.jpg" alt="" />
                      <div className="rp-text">
                        <h6>
                          <Link to="/blog/3">Trải Nghiệm Spa Thư Giãn</Link>
                        </h6>
                        <span className="rp-date">27/08/2019</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Blog Section End */}
    </>
  );
};

export default BlogPage;
