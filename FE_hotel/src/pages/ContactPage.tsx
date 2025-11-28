import { Link } from 'react-router-dom';
import { useFormik } from 'formik';
import * as yup from 'yup';

const validationSchema = yup.object({
  name: yup.string().required('Vui lòng nhập họ tên'),
  email: yup.string().email('Email không hợp lệ').required('Vui lòng nhập email'),
  message: yup.string().required('Vui lòng nhập tin nhắn'),
});

const ContactPage = () => {
  const formik = useFormik({
    initialValues: {
      name: '',
      email: '',
      message: '',
    },
    validationSchema: validationSchema,
    onSubmit: (values) => {
      console.log('Contact form submitted:', values);
      alert('Cảm ơn bạn đã liên hệ! Chúng tôi sẽ phản hồi sớm nhất.');
      formik.resetForm();
    },
  });

  return (
    <>
      {/* Breadcrumb Section Begin */}
      <div className="breadcrumb-section">
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <div className="breadcrumb-text">
                <h2>Liên Hệ</h2>
                <div className="bt-option">
                  <Link to="/">Trang Chủ</Link>
                  <span>Liên Hệ</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Breadcrumb Section End */}

      {/* Contact Section Begin */}
      <section className="contact-section spad">
        <div className="container">
          <div className="row">
            <div className="col-lg-4">
              <div className="contact-text">
                <h2>Thông Tin Liên Hệ</h2>
                <p>Hãy liên hệ với chúng tôi để được tư vấn và hỗ trợ tốt nhất.</p>
                <table>
                  <tbody>
                    <tr>
                      <td className="c-o">Địa chỉ:</td>
                      <td>123 Đường Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh</td>
                    </tr>
                    <tr>
                      <td className="c-o">Điện thoại:</td>
                      <td>(84) 123 456 789</td>
                    </tr>
                    <tr>
                      <td className="c-o">Email:</td>
                      <td>info.hotel@gmail.com</td>
                    </tr>
                    <tr>
                      <td className="c-o">Fax:</td>
                      <td>(84) 123 456 788</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div className="col-lg-7 offset-lg-1">
              <form onSubmit={formik.handleSubmit} className="contact-form">
                <div className="row">
                  <div className="col-lg-6">
                    <input
                      type="text"
                      placeholder="Họ và tên"
                      name="name"
                      value={formik.values.name}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className={formik.touched.name && formik.errors.name ? 'error' : ''}
                    />
                    {formik.touched.name && formik.errors.name && (
                      <div style={{ color: 'red', fontSize: '14px', marginTop: '5px' }}>
                        {formik.errors.name}
                      </div>
                    )}
                  </div>
                  <div className="col-lg-6">
                    <input
                      type="email"
                      placeholder="Email của bạn"
                      name="email"
                      value={formik.values.email}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className={formik.touched.email && formik.errors.email ? 'error' : ''}
                    />
                    {formik.touched.email && formik.errors.email && (
                      <div style={{ color: 'red', fontSize: '14px', marginTop: '5px' }}>
                        {formik.errors.email}
                      </div>
                    )}
                  </div>
                  <div className="col-lg-12">
                    <textarea
                      placeholder="Tin nhắn của bạn"
                      name="message"
                      value={formik.values.message}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className={formik.touched.message && formik.errors.message ? 'error' : ''}
                    ></textarea>
                    {formik.touched.message && formik.errors.message && (
                      <div style={{ color: 'red', fontSize: '14px', marginTop: '5px' }}>
                        {formik.errors.message}
                      </div>
                    )}
                    <button type="submit">Gửi Tin Nhắn</button>
                  </div>
                </div>
              </form>
            </div>
          </div>
          <div className="map">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.325396796539!2d106.69831637570423!3d10.787136589357!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752f38f9ed887b%3A0x14aded124fda8a08!2zTmd1eeG7hW4gSHXhu4csIELhur9uIE5naOG6rywgUXXhuq1uIDEsIFRow6BuaCBwaOG7kSBI4buTIENow60gTWluaCwgVmlldG5hbQ!5e0!3m2!1sen!2s!4v1699000000000!5m2!1sen!2s"
              height="470"
              style={{ border: 0, width: '100%' }}
              allowFullScreen
              title="Bản đồ khách sạn"
            ></iframe>
          </div>
        </div>
      </section>
      {/* Contact Section End */}
    </>
  );
};

export default ContactPage;
