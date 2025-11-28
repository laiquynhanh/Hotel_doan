import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { roomService } from '../services/room.service';
import type { Room, RoomType } from '../types/room.types';
import { formatPrice } from '../utils/currency';
import '../styles/SearchRoomsPage.css';
// useLocation may be used later for parsing query params

const SearchRoomsPage: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filters
  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');
  const [selectedType, setSelectedType] = useState<RoomType | ''>('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [capacity, setCapacity] = useState('');

  // Load all rooms on mount
  useEffect(() => {
    loadAllRooms();
  }, []);

  const loadAllRooms = async () => {
    try {
      setLoading(true);
      const data = await roomService.getAllRooms();
      setRooms(data);
      setError('');
    } catch (err: any) {
      setError('Không thể tải danh sách phòng');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      const params: any = {};
      
      if (checkInDate) params.checkInDate = checkInDate;
      if (checkOutDate) params.checkOutDate = checkOutDate;
      if (selectedType) params.roomType = selectedType;
      if (minPrice) params.minPrice = parseFloat(minPrice);
      if (maxPrice) params.maxPrice = parseFloat(maxPrice);
      if (capacity) params.minCapacity = parseInt(capacity);

      const data = await roomService.searchAvailableRooms(params);
      setRooms(data);
      setError('');
    } catch (err: any) {
      setError(err.response?.data || 'Lỗi khi tìm kiếm phòng');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setCheckInDate('');
    setCheckOutDate('');
    setSelectedType('');
    setMinPrice('');
    setMaxPrice('');
    setCapacity('');
    loadAllRooms();
  };

  const getRoomTypeName = (type: RoomType): string => {
    const types: Record<RoomType, string> = {
      SINGLE: 'Phòng Đơn',
      DOUBLE: 'Phòng Đôi',
      DELUXE: 'Phòng Deluxe',
      SUITE: 'Phòng Suite',
      FAMILY: 'Phòng Gia Đình',
      PREMIUM: 'Phòng Premium'
    };
    return types[type] || type;
  };

  const getAmenitiesList = (amenities: string): string[] => {
    return amenities.split(',').map(a => a.trim());
  };

  return (
    <div className="search-rooms-page">
      {/* Breadcrumb */}
      <div className="breadcrumb-section">
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <div className="breadcrumb-text">
                <h2>Tìm Phòng</h2>
                <div className="bt-option">
                  <Link to="/">Trang Chủ</Link>
                  <span>Tìm Phòng</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <section className="search-section spad">
        <div className="container">
          {/* Search Form */}
          <div className="search-box">
            <h3>Tìm Phòng Trống</h3>
            <form onSubmit={handleSearch}>
              <div className="row">
                <div className="col-lg-3 col-md-6">
                  <div className="form-group">
                    <label>Ngày Nhận Phòng</label>
                    <input
                      type="date"
                      className="form-control"
                      value={checkInDate}
                      onChange={(e) => setCheckInDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                </div>
                
                <div className="col-lg-3 col-md-6">
                  <div className="form-group">
                    <label>Ngày Trả Phòng</label>
                    <input
                      type="date"
                      className="form-control"
                      value={checkOutDate}
                      onChange={(e) => setCheckOutDate(e.target.value)}
                      min={checkInDate || new Date().toISOString().split('T')[0]}
                    />
                  </div>
                </div>

                <div className="col-lg-2 col-md-4">
                  <div className="form-group">
                    <label>Loại Phòng</label>
                    <select 
                      className="form-control"
                      value={selectedType} 
                      onChange={(e) => setSelectedType(e.target.value as RoomType)}
                    >
                      <option value="">Tất cả</option>
                      <option value="SINGLE">Phòng Đơn</option>
                      <option value="DOUBLE">Phòng Đôi</option>
                      <option value="DELUXE">Phòng Deluxe</option>
                      <option value="SUITE">Phòng Suite</option>
                      <option value="FAMILY">Phòng Gia Đình</option>
                      <option value="PREMIUM">Phòng Premium</option>
                    </select>
                  </div>
                </div>

                <div className="col-lg-2 col-md-4">
                  <div className="form-group">
                    <label>Số Khách</label>
                    <input
                      type="number"
                      className="form-control"
                      value={capacity}
                      onChange={(e) => setCapacity(e.target.value)}
                      min="1"
                      placeholder="Số người"
                    />
                  </div>
                </div>

                <div className="col-lg-2 col-md-4">
                  <div className="form-group">
                    <label>&nbsp;</label>
                    <button type="submit" className="btn-search btn-block">
                      Tìm Kiếm
                    </button>
                  </div>
                </div>
              </div>

              <div className="row mt-3">
                <div className="col-lg-3 col-md-6">
                  <div className="form-group">
                    <label>Giá Tối Thiểu ($)</label>
                    <input
                      type="number"
                      className="form-control"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      min="0"
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="col-lg-3 col-md-6">
                  <div className="form-group">
                    <label>Giá Tối Đa ($)</label>
                    <input
                      type="number"
                      className="form-control"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      min="0"
                      placeholder="999"
                    />
                  </div>
                </div>

                <div className="col-lg-2 col-md-4">
                  <div className="form-group">
                    <label>&nbsp;</label>
                    <button type="button" onClick={handleReset} className="btn-reset btn-block">
                      Đặt Lại
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>

          {/* Error Message */}
          {error && (
            <div className="alert alert-danger mt-4">
              {error}
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="loading-spinner text-center mt-5">
              <i className="fa fa-spinner fa-spin fa-3x"></i>
              <p className="mt-3">Đang tải danh sách phòng...</p>
            </div>
          )}

          {/* Rooms List */}
          {!loading && (
            <div className="rooms-list mt-5">
              <h4 className="mb-4">Tìm thấy {rooms.length} phòng</h4>
              <div className="row">
                {rooms.length === 0 ? (
                  <div className="col-12 text-center py-5">
                    <p className="text-muted">Không tìm thấy phòng phù hợp với yêu cầu của bạn</p>
                  </div>
                ) : (
                  rooms.map((room) => (
                    <div key={room.id} className="col-lg-4 col-md-6 mb-4">
                      <div className="room-card">
                        <div className="room-image">
                          <img src={room.imageUrl} alt={room.roomNumber} />
                          <div className="room-type-badge">
                            {getRoomTypeName(room.roomType)}
                          </div>
                        </div>
                        
                        <div className="room-info">
                          <h5>Phòng {room.roomNumber}</h5>
                          <p className="room-desc">{room.description}</p>
                          
                          <div className="room-details">
                            <span>
                              <i className="fa fa-users"></i> {room.capacity} khách
                            </span>
                            <span>
                              <i className="fa fa-expand"></i> {room.size}m²
                            </span>
                          </div>

                          <div className="room-amenities">
                            {getAmenitiesList(room.amenities).slice(0, 3).map((amenity, idx) => (
                              <span key={idx} className="badge badge-secondary mr-1">
                                {amenity}
                              </span>
                            ))}
                          </div>

                          <div className="room-footer">
                            <div className="room-price">
                              <span className="price">{formatPrice(room.pricePerNight)}</span>
                              <span className="period"> / đêm</span>
                            </div>
                            {room.available === false ? (
                              <div className="unavailable-block">
                                <div className="badge badge-warning">Đang được đặt</div>
                                <div className="unavailable-info">Sẵn từ {room.availableFrom} ({room.daysUntilAvailable} ngày)</div>
                                <Link to={`/search-rooms?checkInDate=${room.availableFrom}`} className="btn-small">Tìm từ ngày đó</Link>
                              </div>
                            ) : (
                              <Link to={`/room-details/${room.id}`} className="btn-book">Đặt Ngay</Link>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default SearchRoomsPage;
