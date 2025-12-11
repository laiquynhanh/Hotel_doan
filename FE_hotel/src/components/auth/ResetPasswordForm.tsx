import { useState, useMemo } from 'react';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import authService from '../../services/auth.service';
import './Auth.css';

const validationSchema = yup.object({
  newPassword: yup
    .string()
    .min(6, 'Mật khẩu tối thiểu 6 ký tự')
    .max(128, 'Mật khẩu quá dài')
    .required('Vui lòng nhập mật khẩu mới'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('newPassword')], 'Mật khẩu xác nhận không khớp')
    .required('Vui lòng xác nhận mật khẩu'),
});

const ResetPasswordForm = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = useMemo(() => searchParams.get('token') || '', [searchParams]);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const formik = useFormik({
    initialValues: {
      newPassword: '',
      confirmPassword: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      setError('');
      setSuccess('');
      if (!token) {
        setError('Token không hợp lệ hoặc đã hết hạn. Vui lòng yêu cầu lại.');
        return;
      }
      setIsLoading(true);
      try {
        await authService.resetPassword(token, values.newPassword);
        setSuccess('Đặt lại mật khẩu thành công! Bạn sẽ được chuyển đến trang đăng nhập.');
        setTimeout(() => navigate('/login'), 2000);
      } catch (err: any) {
        setError(err.response?.data || 'Không thể đặt lại mật khẩu. Vui lòng thử lại.');
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
              <h2>Đặt Lại Mật Khẩu</h2>
              <div className="bt-option">
                <Link to="/">Trang chủ</Link>
                <span>Đặt lại mật khẩu</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mt-5 mb-5">
        <div className="row justify-content-center">
          <div className="col-lg-6 col-md-8">
            <div className="booking-form" style={{ padding: '40px' }}>
              <h3 className="text-center mb-4">Nhập mật khẩu mới</h3>
              <p className="text-center text-muted mb-4">
                Vui lòng nhập mật khẩu mới và xác nhận. Liên kết chỉ có hiệu lực trong thời gian ngắn.
              </p>

              {!token && (
                <div className="alert alert-warning" role="alert">
                  Token không hợp lệ hoặc đã hết hạn. Hãy yêu cầu gửi lại email.
                </div>
              )}

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
                  <label className="form-label" htmlFor="newPassword">Mật khẩu mới</label>
                  <input
                    type="password"
                    className={`form-control ${formik.touched.newPassword && formik.errors.newPassword ? 'is-invalid' : ''}`}
                    id="newPassword"
                    name="newPassword"
                    value={formik.values.newPassword}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="Nhập mật khẩu mới"
                  />
                  {formik.touched.newPassword && formik.errors.newPassword && (
                    <div className="invalid-feedback d-block">
                      {formik.errors.newPassword}
                    </div>
                  )}
                </div>

                <div className="mb-4">
                  <label className="form-label" htmlFor="confirmPassword">Xác nhận mật khẩu mới</label>
                  <input
                    type="password"
                    className={`form-control ${formik.touched.confirmPassword && formik.errors.confirmPassword ? 'is-invalid' : ''}`}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formik.values.confirmPassword}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="Nhập lại mật khẩu mới"
                  />
                  {formik.touched.confirmPassword && formik.errors.confirmPassword && (
                    <div className="invalid-feedback d-block">
                      {formik.errors.confirmPassword}
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-100"
                  disabled={isLoading || !token}
                  style={{
                    backgroundColor: '#dfa974',
                    border: 'none',
                    color: '#fff',
                    padding: '15px',
                    fontSize: '16px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    textTransform: 'uppercase',
                    letterSpacing: '2px',
                  }}
                >
                  {isLoading ? 'Đang xử lý...' : 'Đặt Lại Mật Khẩu'}
                </button>

                <div className="text-center mt-4">
                  <p>
                    <Link to="/login" style={{ color: '#dfa974' }}>Quay lại đăng nhập</Link>
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

export default ResetPasswordForm;