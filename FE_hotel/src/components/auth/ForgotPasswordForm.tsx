import { useState } from 'react';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { useNavigate, Link } from 'react-router-dom';
import authService from '../../services/auth.service';
import './Auth.css';

const validationSchema = yup.object({
  email: yup.string()
    .email('Email không hợp lệ')
    .required('Vui lòng nhập email'),
});

const ForgotPasswordForm = () => {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const formik = useFormik({
    initialValues: {
      email: '',
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      setError('');
      setSuccess('');
      setIsLoading(true);
      try {
        await authService.forgotPassword(values.email);
        setSuccess('Email đặt lại mật khẩu đã được gửi! Vui lòng kiểm tra hộp thư của bạn.');
        formik.resetForm();
        // Redirect sau 3 giây
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Email không tồn tại hoặc có lỗi xảy ra. Vui lòng thử lại.');
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
              <h2>Quên Mật Khẩu</h2>
              <div className="bt-option">
                <Link to="/">Trang chủ</Link>
                <span>Quên mật khẩu</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="container mt-5 mb-5">
        <div className="row justify-content-center">
          <div className="col-lg-6 col-md-8">
            <div className="booking-form" style={{padding: '40px'}}>
              <h3 className="text-center mb-4">Quên Mật Khẩu</h3>
              <p className="text-center text-muted mb-4">
                Nhập email của bạn và chúng tôi sẽ gửi cho bạn một liên kết để đặt lại mật khẩu.
              </p>
              
              <form onSubmit={formik.handleSubmit}>
                {error && (
                  <div className="alert alert-danger" role="alert">
                    {error}
                  </div>
                )}

                {success && (
                  <div className="alert alert-success" role="alert">
                    {success}
                  </div>
                )}

                <div className="mb-4">
                  <label htmlFor="email" className="form-label">Email</label>
                  <input
                    type="email"
                    className={`form-control ${formik.touched.email && formik.errors.email ? 'is-invalid' : ''}`}
                    id="email"
                    name="email"
                    value={formik.values.email}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="Nhập email của bạn"
                  />
                  {formik.touched.email && formik.errors.email && (
                    <div className="invalid-feedback d-block">
                      {formik.errors.email}
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
                  {isLoading ? 'Đang gửi...' : 'Gửi Liên Kết Đặt Lại Mật Khẩu'}
                </button>

                <div className="text-center mt-4">
                  <p>
                    <Link to="/login" style={{color: '#dfa974'}}>Quay lại đăng nhập</Link>
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordForm;
