import { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import authService from '../../services/auth.service';
import './Auth.css';

const validationSchema = yup.object({
  username: yup.string().required('Vui lòng nhập tên đăng nhập'),
  password: yup.string().required('Vui lòng nhập mật khẩu'),
});

const LoginForm = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Nếu đã đăng nhập rồi thì redirect về trang chủ
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const formik = useFormik({
    initialValues: {
      username: '',
      password: '',
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      setError('');
      setIsLoading(true);
      try {
        const response = await authService.login(values);
        // Update auth context
        login({
          id: response.userId,
          username: response.username,
          email: response.email,
          fullName: response.fullName,
          role: response.role
        });
        navigate('/'); // Redirect to home after login
      } catch (err) {
        setError('Tên đăng nhập hoặc mật khẩu không đúng');
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
              <h2>Đăng Nhập</h2>
              <div className="bt-option">
                <Link to="/">Trang chủ</Link>
                <span>Đăng nhập</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="container mt-5 mb-5">
        <div className="row justify-content-center">
          <div className="col-lg-6 col-md-8">
            <div className="booking-form" style={{padding: '40px'}}>
              <h3 className="text-center mb-4">Đăng Nhập Tài Khoản</h3>
              
              <form onSubmit={formik.handleSubmit}>
                {error && (
                  <div className="alert alert-danger" role="alert">
                    {error}
                  </div>
                )}

                <div className="mb-4">
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
                  {isLoading ? 'Đang đăng nhập...' : 'Đăng Nhập'}
                </button>

                <div className="text-center mt-4">
                  <p>Chưa có tài khoản? <Link to="/register" style={{color: '#dfa974'}}>Đăng ký ngay</Link></p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;