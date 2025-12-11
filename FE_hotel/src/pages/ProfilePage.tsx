import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as yup from 'yup';
import authService from '../services/auth.service';

const validationSchema = yup.object({
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

const ProfilePage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      // Try to get the freshest user profile from API first
      const userData = await authService.getCurrentUserApi();
      setUser(userData);
      formik.setValues({
        fullName: userData.fullName || '',
        email: userData.email || '',
        phoneNumber: userData.phoneNumber || '',
      });
    } catch (err) {
      console.error('Failed to load user profile', err);
      // Fallback to localStorage if API fails (e.g., token missing/expired)
      const localUser = authService.getCurrentUser();
      if (!localUser) {
        navigate('/login');
        return;
      }
      setUser(localUser);
      formik.setValues({
        fullName: localUser.fullName || '',
        email: localUser.email || '',
        phoneNumber: localUser.phoneNumber || '',
      });
    }
  };

  const formik = useFormik({
    initialValues: {
      fullName: '',
      email: '',
      phoneNumber: '',
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      setError('');
      setSuccess('');
      setIsLoading(true);
      try {
        const updatedUser = await authService.updateProfile(values);
        setUser(updatedUser);
        setSuccess('Cập nhật thông tin thành công!');
        setIsEditing(false);
        
        // Update localStorage
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        localStorage.setItem('user', JSON.stringify({ ...currentUser, ...updatedUser }));
      } catch (err: any) {
        setError(err.response?.data?.message || 'Cập nhật thất bại. Vui lòng thử lại.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    },
  });

  if (!user) {
    return (
      <div className="container" style={{ marginTop: '100px', marginBottom: '100px' }}>
        <div className="text-center">
          <div className="spinner-border"></div>
          <p>Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ marginTop: '100px', marginBottom: '100px' }}>
      <div className="row">
        <div className="col-lg-8 offset-lg-2">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2>Thông tin cá nhân</h2>
            {!isEditing && activeTab === 'profile' && (
              <button 
                className="btn btn-primary"
                onClick={() => setIsEditing(true)}
              >
                <i className="fa fa-edit me-2"></i>Chỉnh sửa
              </button>
            )}
          </div>

          {/* Tabs */}
          <ul className="nav nav-tabs mb-3" role="tablist">
            <li className="nav-item" role="presentation">
              <button 
                className={`nav-link ${activeTab === 'profile' ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab('profile');
                  setIsEditing(false);
                  setError('');
                  setSuccess('');
                }}
              >
                <i className="fa fa-user me-2"></i>Thông tin cá nhân
              </button>
            </li>
            <li className="nav-item" role="presentation">
              <button 
                className={`nav-link ${activeTab === 'password' ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab('password');
                  setError('');
                  setSuccess('');
                }}
              >
                <i className="fa fa-lock me-2"></i>Chỉnh sửa mật khẩu
              </button>
            </li>
          </ul>

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

          <div className="card">
            <div className="card-body">
              {activeTab === 'profile' ? (
                isEditing ? (
                  <form onSubmit={formik.handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label"><strong>Tên đăng nhập:</strong></label>
                    <p className="text-muted">{user.username} (không thể thay đổi)</p>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="fullName" className="form-label"><strong>Họ và tên: *</strong></label>
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
                    <label htmlFor="email" className="form-label"><strong>Email: *</strong></label>
                    <input
                      type="email"
                      className={`form-control ${formik.touched.email && formik.errors.email ? 'is-invalid' : ''}`}
                      id="email"
                      name="email"
                      value={formik.values.email}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      placeholder="Nhập email"
                    />
                    {formik.touched.email && formik.errors.email && (
                      <div className="invalid-feedback d-block">
                        {formik.errors.email}
                      </div>
                    )}
                  </div>

                  <div className="mb-3">
                    <label htmlFor="phoneNumber" className="form-label"><strong>Số điện thoại:</strong></label>
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
                    <small className="text-muted">10 số, bắt đầu bằng số 0</small>
                  </div>

                  <div className="d-flex gap-2">
                    <button 
                      type="submit" 
                      className="btn btn-success"
                      disabled={isLoading}
                    >
                      {isLoading ? 'Đang lưu...' : 'Lưu thay đổi'}
                    </button>
                    <button 
                      type="button" 
                      className="btn btn-secondary"
                      onClick={() => {
                        setIsEditing(false);
                        formik.resetForm();
                        setError('');
                        setSuccess('');
                      }}
                    >
                      Hủy
                    </button>
                  </div>
                </form>
                ) : (
                  <>
                    <div className="mb-3">
                      <label className="form-label"><strong>Tên đăng nhập:</strong></label>
                      <p>{user.username}</p>
                    </div>
                    <div className="mb-3">
                      <label className="form-label"><strong>Họ và tên:</strong></label>
                      <p>{user.fullName}</p>
                    </div>
                    <div className="mb-3">
                      <label className="form-label"><strong>Email:</strong></label>
                      <p>{user.email}</p>
                    </div>
                    <div className="mb-3">
                      <label className="form-label"><strong>Số điện thoại:</strong></label>
                      <p>{user.phoneNumber || 'Chưa cập nhật'}</p>
                    </div>
                    <button className="btn btn-secondary" onClick={() => navigate(-1)}>
                      Quay lại
                    </button>
                  </>
                )
              ) : (
                <ChangePasswordTab setError={setError} setSuccess={setSuccess} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Change Password Component
const ChangePasswordTab = ({ setError, setSuccess }: any) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  const passwordSchema = yup.object({
    currentPassword: yup.string()
      .required('Vui lòng nhập mật khẩu hiện tại'),
    newPassword: yup.string()
      .required('Vui lòng nhập mật khẩu mới')
      .min(6, 'Mật khẩu phải có ít nhất 6 ký tự')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Mật khẩu phải chứa chữ hoa, chữ thường và số'),
    confirmPassword: yup.string()
      .required('Vui lòng xác nhận mật khẩu')
      .oneOf([yup.ref('newPassword')], 'Mật khẩu xác nhận không khớp'),
  });

  const formik = useFormik({
    initialValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
    validationSchema: passwordSchema,
    onSubmit: async (values) => {
      setError('');
      setSuccess('');
      setIsLoading(true);
      try {
        await authService.changePassword({
          currentPassword: values.currentPassword,
          newPassword: values.newPassword,
        });
        setSuccess('Mật khẩu đã được thay đổi thành công!');
        formik.resetForm();
      } catch (err: any) {
        setError(err.response?.data?.message || 'Thay đổi mật khẩu thất bại. Vui lòng thử lại.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    },
  });

  return (
    <form onSubmit={formik.handleSubmit}>
      <div className="mb-3">
        <label htmlFor="currentPassword" className="form-label">
          <strong>Mật khẩu hiện tại: *</strong>
        </label>
        <div className="input-group">
          <input
            type={showCurrentPass ? 'text' : 'password'}
            className={`form-control ${formik.touched.currentPassword && formik.errors.currentPassword ? 'is-invalid' : ''}`}
            id="currentPassword"
            name="currentPassword"
            value={formik.values.currentPassword}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            placeholder="Nhập mật khẩu hiện tại"
          />
          <button 
            type="button"
            className="btn btn-outline-secondary"
            onClick={() => setShowCurrentPass(!showCurrentPass)}
          >
            <i className={`fa fa-${showCurrentPass ? 'eye-slash' : 'eye'}`}></i>
          </button>
        </div>
        {formik.touched.currentPassword && formik.errors.currentPassword && (
          <div className="invalid-feedback d-block">
            {formik.errors.currentPassword}
          </div>
        )}
      </div>

      <div className="mb-3">
        <label htmlFor="newPassword" className="form-label">
          <strong>Mật khẩu mới: *</strong>
        </label>
        <div className="input-group">
          <input
            type={showNewPass ? 'text' : 'password'}
            className={`form-control ${formik.touched.newPassword && formik.errors.newPassword ? 'is-invalid' : ''}`}
            id="newPassword"
            name="newPassword"
            value={formik.values.newPassword}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự, chứa A-Z, a-z, 0-9)"
          />
          <button 
            type="button"
            className="btn btn-outline-secondary"
            onClick={() => setShowNewPass(!showNewPass)}
          >
            <i className={`fa fa-${showNewPass ? 'eye-slash' : 'eye'}`}></i>
          </button>
        </div>
        {formik.touched.newPassword && formik.errors.newPassword && (
          <div className="invalid-feedback d-block">
            {formik.errors.newPassword}
          </div>
        )}
        <small className="text-muted d-block mt-2">
          Mật khẩu phải có ít nhất 6 ký tự, bao gồm chữ hoa (A-Z), chữ thường (a-z) và số (0-9)
        </small>
      </div>

      <div className="mb-3">
        <label htmlFor="confirmPassword" className="form-label">
          <strong>Xác nhận mật khẩu mới: *</strong>
        </label>
        <div className="input-group">
          <input
            type={showConfirmPass ? 'text' : 'password'}
            className={`form-control ${formik.touched.confirmPassword && formik.errors.confirmPassword ? 'is-invalid' : ''}`}
            id="confirmPassword"
            name="confirmPassword"
            value={formik.values.confirmPassword}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            placeholder="Nhập lại mật khẩu mới"
          />
          <button 
            type="button"
            className="btn btn-outline-secondary"
            onClick={() => setShowConfirmPass(!showConfirmPass)}
          >
            <i className={`fa fa-${showConfirmPass ? 'eye-slash' : 'eye'}`}></i>
          </button>
        </div>
        {formik.touched.confirmPassword && formik.errors.confirmPassword && (
          <div className="invalid-feedback d-block">
            {formik.errors.confirmPassword}
          </div>
        )}
      </div>

      <div className="d-flex gap-2">
        <button 
          type="submit" 
          className="btn btn-success"
          disabled={isLoading}
        >
          {isLoading ? 'Đang thay đổi...' : 'Thay đổi mật khẩu'}
        </button>
      </div>
    </form>
  );
};

export default ProfilePage;
