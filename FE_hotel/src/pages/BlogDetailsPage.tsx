import { Link, useParams } from 'react-router-dom';

const BlogDetailsPage = () => {
  // consume route params if needed later; avoid unused variable errors
  useParams();

  return (
    <>
      {/* Blog Details Hero Section Begin */}
      <section 
        className="blog-details-hero set-bg" 
        style={{ backgroundImage: 'url(/img/blog/blog-details/blog-details-hero.jpg)' }}
      >
        <div className="container">
          <div className="row">
            <div className="col-lg-10 offset-lg-1">
              <div className="bd-hero-text">
                <span>Du Lịch & Cắm Trại</span>
                <h2>Khám Phá Những Điểm Du Lịch Tuyệt Vời Tại Việt Nam</h2>
                <ul>
                  <li className="b-time"><i className="icon_clock_alt"></i> 15/04/2019</li>
                  <li><i className="icon_profile"></i> Nguyễn Văn A</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Blog Details Hero End */}

      {/* Blog Details Section Begin */}
      <section className="blog-details-section">
        <div className="container">
          <div className="row">
            <div className="col-lg-10 offset-lg-1">
              <div className="blog-details-text">
                <div className="bd-title">
                  <p>Bạn đang nghĩ đến việc du lịch phiêu lưu ở nước ngoài? Bạn đã nghĩ đến những địa điểm tốt nhất
                    khi nói đến du lịch phiêu lưu ở nước ngoài chưa? Nepal là một trong những địa điểm phổ biến nhất,
                    khi bạn ghé thăm đất nước kỳ diệu này, bạn sẽ có những cuộc phiêu lưu tuyệt vời nhất ngay trước
                    cửa nhà bạn.</p>
                  <p>Ở Nepal, chuyến du lịch phiêu lưu của bạn sẽ rất hấp dẫn. Bạn sẽ được ngắm nhìn dãy núi Himalaya
                    và trải nghiệm tất cả những gì mà nền văn hóa Nepal phong phú có thể mang lại. Họ là những con người
                    tuyệt vời, những người đã cố gắng giữ gìn văn hóa và niềm tin của riêng mình.</p>
                </div>
                <div className="bd-pic">
                  <div className="bp-item">
                    <img src="/img/blog/blog-details/blog-details-1.jpg" alt="" />
                  </div>
                  <div className="bp-item">
                    <img src="/img/blog/blog-details/blog-details-2.jpg" alt="" />
                  </div>
                </div>
                <div className="bd-more-text">
                  <div className="bm-item">
                    <h4>Khám Phá Vẻ Đẹp Thiên Nhiên</h4>
                    <p>Du lịch không chỉ là việc di chuyển từ nơi này đến nơi khác, mà còn là cơ hội để khám phá
                      những điều mới mẻ, trải nghiệm văn hóa địa phương và tạo ra những kỷ niệm đáng nhớ. Việt Nam
                      với cảnh quan thiên nhiên đa dạng, từ núi non hùng vĩ đến biển cả xanh ngắt, luôn là điểm đến
                      lý tưởng cho những ai yêu thích khám phá.</p>
                    <p>Các vùng núi phía Bắc như Sapa, Hà Giang mang đến những thửa ruộng bậc thang tuyệt đẹp và
                      không khí trong lành. Trong khi đó, các bãi biển miền Trung như Đà Nẵng, Nha Trang lại thu hút
                      du khách bởi làn nước trong xanh và bờ cát trắng mịn.</p>
                  </div>
                  <div className="bm-item">
                    <h4>Trải Nghiệm Ẩm Thực Đặc Sắc</h4>
                    <p>Ẩm thực Việt Nam được biết đến trên toàn thế giới với hương vị đậm đà, đa dạng và phong phú.
                      Mỗi vùng miền lại có những món ăn đặc trưng riêng, từ phở Bắc, bún bò Huế đến hủ tiếu Nam Vang.
                      Việc thưởng thức những món ăn địa phương là một phần không thể thiếu trong mỗi chuyến du lịch.</p>
                  </div>
                </div>
                <div className="bd-quote">
                  <p>"Du lịch là cách duy nhất bạn chi tiền mà trở nên giàu có hơn."</p>
                </div>
                <div className="bd-more-text">
                  <div className="bm-item">
                    <h4>Lời Khuyên Cho Chuyến Du Lịch</h4>
                    <p>Trước khi bắt đầu chuyến đi, hãy chuẩn bị kỹ lưỡng: nghiên cứu về địa điểm, lên kế hoạch
                      chi tiết và đặt phòng khách sạn trước. Đừng quên mang theo những vật dụng cần thiết như thuốc,
                      quần áo phù hợp với thời tiết và máy ảnh để ghi lại những khoảnh khắc đáng nhớ.</p>
                    <ul>
                      <li><i className="icon_check"></i> Lên kế hoạch chi tiết trước khi đi</li>
                      <li><i className="icon_check"></i> Đặt phòng khách sạn sớm để có giá tốt</li>
                      <li><i className="icon_check"></i> Mang theo đầy đủ giấy tờ cần thiết</li>
                      <li><i className="icon_check"></i> Tìm hiểu văn hóa địa phương</li>
                      <li><i className="icon_check"></i> Chuẩn bị ngân sách hợp lý</li>
                    </ul>
                  </div>
                </div>
                <div className="bd-pic">
                  <div className="bp-item">
                    <img src="/img/blog/blog-details/blog-details-3.jpg" alt="" />
                  </div>
                </div>
                <div className="tag-share">
                  <div className="tags">
                    <Link to="/blog">Du Lịch</Link>
                    <Link to="/blog">Khách Sạn</Link>
                    <Link to="/blog">Phiêu Lưu</Link>
                  </div>
                  <div className="social-share">
                    <span>Chia Sẻ</span>
                    <a href="#"><i className="fa fa-facebook"></i></a>
                    <a href="#"><i className="fa fa-twitter"></i></a>
                    <a href="#"><i className="fa fa-instagram"></i></a>
                    <a href="#"><i className="fa fa-pinterest"></i></a>
                  </div>
                </div>
                <div className="comment-option">
                  <h4>2 Bình Luận</h4>
                  <div className="co-item">
                    <div className="avatar-pic">
                      <img src="/img/blog/blog-details/avatar/avatar-1.jpg" alt="" />
                    </div>
                    <div className="avatar-text">
                      <div className="at-rating">
                        <i className="icon_star"></i>
                        <i className="icon_star"></i>
                        <i className="icon_star"></i>
                        <i className="icon_star"></i>
                        <i className="icon_star-half_alt"></i>
                      </div>
                      <h5>Trần Thị B <span>27/08/2019</span></h5>
                      <p>Bài viết rất hay và hữu ích! Tôi đã có thêm nhiều ý tưởng cho chuyến du lịch sắp tới của mình.
                        Cảm ơn tác giả đã chia sẻ những kinh nghiệm quý báu này.</p>
                    </div>
                  </div>
                  <div className="co-item">
                    <div className="avatar-pic">
                      <img src="/img/blog/blog-details/avatar/avatar-2.jpg" alt="" />
                    </div>
                    <div className="avatar-text">
                      <div className="at-rating">
                        <i className="icon_star"></i>
                        <i className="icon_star"></i>
                        <i className="icon_star"></i>
                        <i className="icon_star"></i>
                        <i className="icon_star"></i>
                      </div>
                      <h5>Lê Văn C <span>27/08/2019</span></h5>
                      <p>Những lời khuyên rất thực tế và dễ áp dụng. Tôi sẽ lưu lại bài viết này để tham khảo cho
                        các chuyến đi sau. Rất mong có thêm nhiều bài viết hay như thế này!</p>
                    </div>
                  </div>
                </div>
                <div className="leave-comment">
                  <h4>Để Lại Bình Luận</h4>
                  <form action="#" className="comment-form">
                    <div className="row">
                      <div className="col-lg-6">
                        <input type="text" placeholder="Tên của bạn" />
                      </div>
                      <div className="col-lg-6">
                        <input type="text" placeholder="Email của bạn" />
                      </div>
                      <div className="col-lg-12">
                        <textarea placeholder="Bình luận của bạn"></textarea>
                        <button type="submit" className="site-btn">Gửi Bình Luận</button>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Blog Details Section End */}
    </>
  );
};

export default BlogDetailsPage;
