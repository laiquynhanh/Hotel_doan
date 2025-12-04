import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { foodService } from '../services/food.service';
import { formatPrice } from '../utils/currency';
import type { FoodItem } from '../types/food.types';
import '../styles/MenuPage.css';

const MenuPage = () => {
  const navigate = useNavigate();
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [bannerImage, setBannerImage] = useState('/img/hero/hero-3.jpg');

  const categories = [
    { value: 'ALL', label: 'Tất Cả', icon: '🍽️' },
    { value: 'BREAKFAST', label: 'Bữa Sáng', icon: '🌅' },
    { value: 'LUNCH', label: 'Bữa Trưa', icon: '☀️' },
    { value: 'DINNER', label: 'Bữa Tối', icon: '🌙' },
    { value: 'DRINKS', label: 'Đồ Uống', icon: '🍹' },
    { value: 'DESSERT', label: 'Tráng Miệng', icon: '🍰' }
  ];

  useEffect(() => {
    // Load banner config from localStorage
    const config = localStorage.getItem('bannerConfig');
    if (config) {
      try {
        const parsed = JSON.parse(config);
        if (parsed.menu) {
          setBannerImage(parsed.menu);
        }
      } catch (e) {
        console.error('Error parsing banner config:', e);
      }
    }
    
    loadFoodItems();
  }, []);

  useEffect(() => {
    filterItems();
  }, [selectedCategory, searchQuery, foodItems]);

  const loadFoodItems = async () => {
    try {
      setLoading(true);
      const data = await foodService.getAllFoodItems();
      setFoodItems(data);
    } catch (error) {
      console.error('Error loading food items:', error);
      alert('Không thể tải menu');
    } finally {
      setLoading(false);
    }
  };

  const filterItems = () => {
    let filtered = foodItems;

    // Filter by category
    if (selectedCategory !== 'ALL') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredItems(filtered);
  };

  const handleOrderNow = () => {
    navigate('/room-service');
  };

  if (loading) {
    return (
      <div className="container text-center py-5">
        <div className="spinner-border" role="status" style={{ color: '#dfa974' }}>
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="menu-page">
      {/* Hero Section */}
      <section className="menu-hero" style={{ backgroundImage: `url(${bannerImage})` }}>
        <div className="container">
          <h1 className="text-center">Thực Đơn Khách Sạn</h1>
          <p className="text-center lead">Khám phá các món ăn ngon và dịch vụ ẩm thực cao cấp</p>
        </div>
      </section>

      <div className="container my-5">
        {/* Search Bar */}
        <div className="row mb-4">
          <div className="col-md-8 mx-auto">
            <div className="input-group">
              <span className="input-group-text">
                <i className="fa fa-search"></i>
              </span>
              <input
                type="text"
                className="form-control"
                placeholder="Tìm kiếm món ăn..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Category Filter */}
        <div className="category-filter mb-5">
          <div className="d-flex justify-content-center flex-wrap gap-2">
            {categories.map(cat => (
              <button
                key={cat.value}
                className={`btn category-btn ${selectedCategory === cat.value ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat.value)}
              >
                <span className="me-2">{cat.icon}</span>
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Food Items Grid */}
        {filteredItems.length === 0 ? (
          <div className="text-center py-5">
            <i className="fa fa-search fa-3x text-muted mb-3"></i>
            <p className="text-muted">Không tìm thấy món ăn nào</p>
          </div>
        ) : (
          <div className="row g-4">
            {filteredItems.map(item => (
              <div key={item.id} className="col-lg-4 col-md-6">
                <div className="food-card">
                  <div className="food-image">
                    <img
                      src={item.imageUrl || '/img/food/default.jpg'}
                      alt={item.name}
                      onError={(e) => {
                        e.currentTarget.src = '/img/food/default.jpg';
                      }}
                    />
                    {!item.available && (
                      <div className="unavailable-badge">Hết hàng</div>
                    )}
                  </div>
                  <div className="food-details">
                    <h5 className="food-name">{item.name}</h5>
                    <p className="food-description">{item.description}</p>
                    <div className="d-flex justify-content-between align-items-center">
                      <span className="food-price">{formatPrice(item.price)}</span>
                      <span className="food-category-badge">
                        {categories.find(c => c.value === item.category)?.icon}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Call to Action */}
        <div className="text-center mt-5">
          <button className="btn btn-primary btn-lg" onClick={handleOrderNow}>
            <i className="fa fa-shopping-cart me-2"></i>
            Đặt Món Ngay
          </button>
          <button
            className="btn btn-outline-primary btn-lg ms-3"
            onClick={() => navigate('/restaurant-booking')}
          >
            <i className="fa fa-calendar me-2"></i>
            Đặt Bàn Nhà Hàng
          </button>
        </div>
      </div>
    </div>
  );
};

export default MenuPage;
