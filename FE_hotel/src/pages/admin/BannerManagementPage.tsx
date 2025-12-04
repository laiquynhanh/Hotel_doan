import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import '../../styles/BannerManagement.css';

interface BannerConfig {
  homepage: string[];
  rooms: string;
  menu: string;
}

const BannerManagementPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [config, setConfig] = useState<BannerConfig>({
    homepage: ['/img/hero/hero-1.jpg', '/img/hero/hero-2.jpg', '/img/hero/hero-3.jpg'],
    rooms: '/img/room/room-b1.jpg',
    menu: '/img/hero/hero-3.jpg'
  });

  const [availableImages] = useState<string[]>([
    '/img/hero/hero-1.jpg',
    '/img/hero/hero-2.jpg',
    '/img/hero/hero-3.jpg',
    '/img/room/room-b1.jpg',
    '/img/room/room-b2.jpg',
    '/img/room/room-b3.jpg',
    '/img/about/about-1.jpg',
    '/img/about/about-2.jpg',
    '/img/gallery/gallery-1.jpg',
    '/img/gallery/gallery-2.jpg',
    '/img/gallery/gallery-3.jpg',
    '/img/gallery/gallery-4.jpg',
  ]);

  const [selectedPage, setSelectedPage] = useState<'homepage' | 'rooms' | 'menu'>('homepage');
  const [previewImage, setPreviewImage] = useState<string>('');

  useEffect(() => {
    // Check admin permission
    if (!user || user.role !== 'ADMIN') {
      alert('Bạn không có quyền truy cập trang này');
      navigate('/');
      return;
    }

    // Load config from localStorage
    const saved = localStorage.getItem('bannerConfig');
    if (saved) {
      setConfig(JSON.parse(saved));
    }
  }, [user, navigate]);

  const saveConfig = () => {
    localStorage.setItem('bannerConfig', JSON.stringify(config));
    alert('Đã lưu cấu hình banner!\n\nLưu ý: Cần refresh các trang để áp dụng thay đổi.');
  };

  const updateHomepageBanner = (index: number, imageUrl: string) => {
    const newHomepage = [...config.homepage];
    newHomepage[index] = imageUrl;
    setConfig({ ...config, homepage: newHomepage });
  };

  const updatePageBanner = (page: 'rooms' | 'menu', imageUrl: string) => {
    setConfig({ ...config, [page]: imageUrl });
  };

  const resetToDefault = () => {
    const defaultConfig: BannerConfig = {
      homepage: ['/img/hero/hero-1.jpg', '/img/hero/hero-2.jpg', '/img/hero/hero-3.jpg'],
      rooms: '/img/room/room-b1.jpg',
      menu: '/img/hero/hero-3.jpg'
    };
    setConfig(defaultConfig);
    localStorage.setItem('bannerConfig', JSON.stringify(defaultConfig));
    alert('Đã khôi phục cấu hình mặc định!');
  };

  return (
    <div className="banner-management-page">
      <div className="container py-5">
        <div className="row mb-4">
          <div className="col-lg-12">
            <div className="d-flex justify-content-between align-items-center">
              <h2>Quản Lý Banner</h2>
              <div>
                <button className="btn btn-secondary me-2" onClick={resetToDefault}>
                  <i className="fa fa-undo me-2"></i>
                  Khôi Phục Mặc Định
                </button>
                <button className="btn btn-success" onClick={saveConfig}>
                  <i className="fa fa-save me-2"></i>
                  Lưu Thay Đổi
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          {/* Left Panel - Page Selection */}
          <div className="col-lg-3">
            <div className="card">
              <div className="card-header">
                <h5 className="mb-0">Chọn Trang</h5>
              </div>
              <div className="list-group list-group-flush">
                <button
                  className={`list-group-item list-group-item-action ${selectedPage === 'homepage' ? 'active' : ''}`}
                  onClick={() => setSelectedPage('homepage')}
                >
                  <i className="fa fa-home me-2"></i>
                  Trang Chủ (3 ảnh slider)
                </button>
                <button
                  className={`list-group-item list-group-item-action ${selectedPage === 'rooms' ? 'active' : ''}`}
                  onClick={() => setSelectedPage('rooms')}
                >
                  <i className="fa fa-bed me-2"></i>
                  Trang Phòng
                </button>
                <button
                  className={`list-group-item list-group-item-action ${selectedPage === 'menu' ? 'active' : ''}`}
                  onClick={() => setSelectedPage('menu')}
                >
                  <i className="fa fa-cutlery me-2"></i>
                  Trang Menu
                </button>
              </div>
            </div>
          </div>

          {/* Middle Panel - Current Banners */}
          <div className="col-lg-5">
            <div className="card">
              <div className="card-header">
                <h5 className="mb-0">Banner Hiện Tại</h5>
              </div>
              <div className="card-body">
                {selectedPage === 'homepage' ? (
                  <>
                    <p className="text-muted">Trang chủ sử dụng 3 ảnh slider:</p>
                    {config.homepage.map((img, index) => (
                      <div key={index} className="mb-3">
                        <label className="form-label fw-bold">Ảnh {index + 1}</label>
                        <div className="banner-preview">
                          <img src={img} alt={`Hero ${index + 1}`} className="img-fluid rounded" />
                          <div className="mt-2">
                            <small className="text-muted">{img}</small>
                          </div>
                        </div>
                      </div>
                    ))}
                  </>
                ) : (
                  <>
                    <p className="text-muted">Banner cho trang {selectedPage === 'rooms' ? 'Phòng' : 'Menu'}:</p>
                    <div className="banner-preview">
                      <img 
                        src={config[selectedPage]} 
                        alt={selectedPage} 
                        className="img-fluid rounded" 
                      />
                      <div className="mt-2">
                        <small className="text-muted">{config[selectedPage]}</small>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Right Panel - Available Images */}
          <div className="col-lg-4">
            <div className="card">
              <div className="card-header">
                <h5 className="mb-0">Chọn Ảnh Mới</h5>
              </div>
              <div className="card-body" style={{ maxHeight: '600px', overflowY: 'auto' }}>
                <div className="row g-2">
                  {availableImages.map((img, idx) => (
                    <div key={idx} className="col-6">
                      <div 
                        className="image-option"
                        onClick={() => setPreviewImage(img)}
                        onDoubleClick={() => {
                          if (selectedPage === 'homepage') {
                            // For homepage, show modal to select which position
                            const position = prompt('Chọn vị trí ảnh (1, 2, hoặc 3):');
                            if (position && ['1', '2', '3'].includes(position)) {
                              updateHomepageBanner(parseInt(position) - 1, img);
                            }
                          } else {
                            updatePageBanner(selectedPage, img);
                          }
                        }}
                      >
                        <img src={img} alt={`Option ${idx}`} className="img-fluid rounded" />
                        <div className="overlay">
                          <small>{img.split('/').pop()}</small>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-3 text-center">
                  <small className="text-muted">
                    💡 Click đúp vào ảnh để chọn
                  </small>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Preview Modal */}
        {previewImage && (
          <div className="modal-overlay" onClick={() => setPreviewImage('')}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <button className="btn-close-modal" onClick={() => setPreviewImage('')}>
                <i className="fa fa-times"></i>
              </button>
              <img src={previewImage} alt="Preview" className="img-fluid" />
              <div className="mt-3 text-center">
                <p className="text-muted">{previewImage}</p>
                <button 
                  className="btn btn-primary"
                  onClick={() => {
                    if (selectedPage === 'homepage') {
                      const position = prompt('Chọn vị trí ảnh (1, 2, hoặc 3):');
                      if (position && ['1', '2', '3'].includes(position)) {
                        updateHomepageBanner(parseInt(position) - 1, previewImage);
                        setPreviewImage('');
                      }
                    } else {
                      updatePageBanner(selectedPage, previewImage);
                      setPreviewImage('');
                    }
                  }}
                >
                  Chọn Ảnh Này
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BannerManagementPage;
