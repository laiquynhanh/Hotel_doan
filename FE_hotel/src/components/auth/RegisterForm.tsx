import { useState } from 'react';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { useNavigate, Link } from 'react-router-dom';
import authService from '../../services/auth.service';
import './Auth.css';

const validationSchema = yup.object({
  username: yup.string()
    .required('Vui lòng nhập tên đăng nhập')
    .min(3, 'Tên đăng nhập phải có ít nhất 3 ký tự')
    .max(50, 'Tên đăng nhập không quá 50 ký tự'),
  password: yup.string()
    .required('Vui lòng nhập mật khẩu')
    .min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
  fullName: yup.string()
    .required('Vui lòng nhập họ và tên')
    .matches(/^[a-zA-ZÀ-ỹ\s]+$/, 'Họ tên chỉ được chứa chữ cái và khoảng trắng')
    .min(2, 'Họ tên phải có ít nhất 2 ký tự')
    .max(100, 'Họ tên không quá 100 ký tự'),
  email: yup.string()
    .email('Email không hợp lệ')
    .required('Vui lòng nhập email'),
  phoneNumber: yup.string()
    .matches(/^0\d{9}$/, 'Số điện thoại phải có 10 số và bắt đầu bằng số 0')
    .nullable(),
});

const RegisterForm = () => {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const formik = useFormik({
    initialValues: {
      username: '',
      password: '',
      fullName: '',
      email: '',
      phoneNumber: '',
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      setError('');
      setIsLoading(true);
      try {
        await authService.register(values);
        navigate('/login');
      } catch (err) {
        setError('Đăng ký thất bại. Tên đăng nhập hoặc email đã được sử dụng.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    },
  });

  return (
    <div className="breadcrumb-section">
      <div className="container">
        <div className="row">
          <div className="col-lg-12">
            <div className="breadcrumb-text">
              <h2>Đăng Ký</h2>
              <div className="bt-option">
                <Link to="/">Trang chủ</Link>
                <span>Đăng ký</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mt-5 mb-5">
        <div className="row justify-content-center">
          <div className="col-lg-6 col-md-8">
            <div className="booking-form" style={{padding: '40px'}}>
              <h3 className="text-center mb-4">Tạo Tài Khoản Mới</h3>
              
              <form onSubmit={formik.handleSubmit}>
                {error && (
                  <div className="alert alert-danger" role="alert">
                    {error}
                  </div>
                )}

                <div className="mb-3">
                  <label htmlFor="username" className="form-label">Tên đăng nhập</label>
                  <input
                    type="text"
                    className={`form-control ${formik.touched.username && formik.errors.username ? 'is-invalid' : ''}`}
                    id="username"
                    name="username"
                    value={formik.values.username}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="Nhập tên đăng nhập"
                  />
                  {formik.touched.username && formik.errors.username && (
                    <div className="invalid-feedback d-block">
                      {formik.errors.username}
                    </div>
                  )}
                </div>

                <div className="mb-3">
                  <label htmlFor="email" className="form-label">Email</label>
                  <input
                    type="email"
                    className={`form-control ${formik.touched.email && formik.errors.email ? 'is-invalid' : ''}`}
                    id="email"
                    name="email"
                    value={formik.values.email}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="Nhập địa chỉ email"
                  />
                  {formik.touched.email && formik.errors.email && (
                    <div className="invalid-feedback d-block">
                      {formik.errors.email}
                    </div>
                  )}
                </div>

                <div className="mb-3">
                  <label htmlFor="fullName" className="form-label">Họ và tên</label>
                  <input
                    type="text"
                    className={`form-control ${formik.touched.fullName && formik.errors.fullName ? 'is-invalid' : ''}`}
                    id="fullName"
                    name="fullName"
                    value={formik.values.fullName}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="Nhập họ và tên"
                  />
                  {formik.touched.fullName && formik.errors.fullName && (
                    <div className="invalid-feedback d-block">
                      {formik.errors.fullName}
                    </div>
                  )}
                </div>

                <div className="mb-3">
                  <label htmlFor="phoneNumber" className="form-label">Số điện thoại (tùy chọn)</label>
                  <input
                    type="text"
                    className={`form-control ${formik.touched.phoneNumber && formik.errors.phoneNumber ? 'is-invalid' : ''}`}
                    id="phoneNumber"
                    name="phoneNumber"
                    value={formik.values.phoneNumber}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="Nhập số điện thoại (VD: 0123456789)"
                  />
                  {formik.touched.phoneNumber && formik.errors.phoneNumber && (
                    <div className="invalid-feedback d-block">
                      {formik.errors.phoneNumber}
                    </div>
                  )}
                </div>

                <div className="mb-4">
                  <label htmlFor="password" className="form-label">Mật khẩu</label>
                  <input
                    type="password"
                    className={`form-control ${formik.touched.password && formik.errors.password ? 'is-invalid' : ''}`}
                    id="password"
                    name="password"
                    value={formik.values.password}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="Nhập mật khẩu"
                  />
                  {formik.touched.password && formik.errors.password && (
                    <div className="invalid-feedback d-block">
                      {formik.errors.password}
                    </div>
                  )}
                </div>

                <button 
                  type="submit" 
                  className="w-100"
                  disabled={isLoading}
                  style={{
                    backgroundColor: '#dfa974',
                    border: 'none',
                    color: '#fff',
                    padding: '15px',
                    fontSize: '16px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    textTransform: 'uppercase',
                    letterSpacing: '2px'
                  }}
                >
                  {isLoading ? 'Đang đăng ký...' : 'Đăng Ký'}
                </button>

                <div className="text-center mt-4">
                  <p>Đã có tài khoản? <Link to="/login" style={{color: '#dfa974'}}>Đăng nhập ngay</Link></p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;