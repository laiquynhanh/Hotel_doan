import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './UserMenu.css';

const UserMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  // Close dropdown on outside click, Escape key or scroll
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    const handleScroll = () => {
      setIsOpen(false);
    };

    document.addEventListener('click', handleClickOutside);
    document.addEventListener('keydown', handleEsc);
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('keydown', handleEsc);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isOpen]);

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    navigate('/');
  };

  if (!user) return null;

  return (
    <div className="user-menu-wrapper" ref={wrapperRef}>
      <button
        type="button"
        className="user-menu-button"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen((prev) => !prev);
        }}
      >
        <i className="fa fa-user-circle"></i>
        <span>{user.fullName || user.username}</span>
        <i className={`fa fa-angle-${isOpen ? 'up' : 'down'}`}></i>
      </button>

      {isOpen && (
        <div className="user-menu-dropdown">
          <div className="user-menu-header">
            <p className="user-name">{user.fullName}</p>
            <p className="user-email">{user.email}</p>
            <span className={`user-role ${user.role.toLowerCase()}`}>
              {user.role}
            </span>
          </div>
          
          <div className="user-menu-divider"></div>
          
          <ul className="user-menu-items">
            <li>
              <Link to="/profile" onClick={() => setIsOpen(false)}>
                <i className="fa fa-user"></i>
                Thông tin cá nhân
              </Link>
            </li>
            <li>
              <Link to="/my-bookings" onClick={() => setIsOpen(false)}>
                <i className="fa fa-calendar"></i>
                Đặt phòng của tôi
              </Link>
            </li>
            {user.role === 'ADMIN' && (
              <>
                <div className="user-menu-divider"></div>
                <li>
                  <Link to="/admin" onClick={() => setIsOpen(false)} className="admin-link">
                    <i className="fa fa-tachometer"></i>
                    Quản trị Admin
                  </Link>
                </li>
              </>
            )}
            <div className="user-menu-divider"></div>
            <li>
              <button onClick={handleLogout} className="logout-button">
                <i className="fa fa-sign-out"></i>
                Đăng xuất
              </button>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default UserMenu;
