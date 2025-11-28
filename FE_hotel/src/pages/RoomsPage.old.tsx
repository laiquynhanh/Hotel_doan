import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { roomService } from '../services/room.service';
import type { Room, RoomType } from '../types/room.types';
import './RoomsPage.css';

const RoomsPage: React.FC = () => {
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
    <>
      {/* Breadcrumb Section Begin */}
      <div className="breadcrumb-section">
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <div className="breadcrumb-text">
                <h2>Phòng Của Chúng Tôi</h2>
                <div className="bt-option">
                  <Link to="/">Trang Chủ</Link>
                  <span>Phòng</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Breadcrumb Section End */}

      {/* Rooms Section Begin */}
      <section className="rooms-section spad">
        <div className="container">
          <div className="row">
            <div className="col-lg-4 col-md-6">
              <div className="room-item">
                <img src="/img/room/room-1.jpg" alt="" />
                <div className="ri-text">
                  <h4>Phòng King Cao Cấp</h4>
                  <h3>3.975.000₫<span>/Đêm</span></h3>
                  <table>
                    <tbody>
                      <tr>
                        <td className="r-o">Diện Tích:</td>
                        <td>30 m²</td>
                      </tr>
                      <tr>
                        <td className="r-o">Sức Chứa:</td>
                        <td>Tối đa 3 người</td>
                      </tr>
                      <tr>
                        <td className="r-o">Giường:</td>
                        <td>Giường King</td>
                      </tr>
                      <tr>
                        <td className="r-o">Dịch Vụ:</td>
                        <td>Wifi, TV, Phòng Tắm,...</td>
                      </tr>
                    </tbody>
                  </table>
                  <Link to="/room-details/1" className="primary-btn">Chi Tiết</Link>
                </div>
              </div>
            </div>
            <div className="col-lg-4 col-md-6">
              <div className="room-item">
                <img src="/img/room/room-2.jpg" alt="" />
                <div className="ri-text">
                  <h4>Phòng Gia Đình</h4>
                  <h3>7.475.000₫<span>/Đêm</span></h3>
                  <table>
                    <tbody>
                      <tr>
                        <td className="r-o">Diện Tích:</td>
                        <td>45 m²</td>
                      </tr>
                      <tr>
                        <td className="r-o">Sức Chứa:</td>
                        <td>Tối đa 6 người</td>
                      </tr>
                      <tr>
                        <td className="r-o">Giường:</td>
                        <td>2 Giường Đôi</td>
                      </tr>
                      <tr>
                        <td className="r-o">Dịch Vụ:</td>
                        <td>Wifi, TV, Phòng Tắm,...</td>
                      </tr>
                    </tbody>
                  </table>
                  <Link to="/room-details/2" className="primary-btn">Chi Tiết</Link>
                </div>
              </div>
            </div>
            <div className="col-lg-4 col-md-6">
              <div className="room-item">
                <img src="/img/room/room-3.jpg" alt="" />
                <div className="ri-text">
                  <h4>Phòng Đôi</h4>
                  <h3>4.975.000₫<span>/Đêm</span></h3>
                  <table>
                    <tbody>
                      <tr>
                        <td className="r-o">Diện Tích:</td>
                        <td>35 m²</td>
                      </tr>
                      <tr>
                        <td className="r-o">Sức Chứa:</td>
                        <td>Tối đa 2 người</td>
                      </tr>
                      <tr>
                        <td className="r-o">Giường:</td>
                        <td>Giường Đôi</td>
                      </tr>
                      <tr>
                        <td className="r-o">Dịch Vụ:</td>
                        <td>Wifi, TV, Phòng Tắm,...</td>
                      </tr>
                    </tbody>
                  </table>
                  <Link to="/room-details/3" className="primary-btn">Chi Tiết</Link>
                </div>
              </div>
            </div>
            <div className="col-lg-4 col-md-6">
              <div className="room-item">
                <img src="/img/room/room-4.jpg" alt="" />
                <div className="ri-text">
                  <h4>Phòng Deluxe</h4>
                  <h3>4.950.000₫<span>/Đêm</span></h3>
                  <table>
                    <tbody>
                      <tr>
                        <td className="r-o">Diện Tích:</td>
                        <td>40 m²</td>
                      </tr>
                      <tr>
                        <td className="r-o">Sức Chứa:</td>
                        <td>Tối đa 4 người</td>
                      </tr>
                      <tr>
                        <td className="r-o">Giường:</td>
                        <td>Giường King</td>
                      </tr>
                      <tr>
                        <td className="r-o">Dịch Vụ:</td>
                        <td>Wifi, TV, Phòng Tắm,...</td>
                      </tr>
                    </tbody>
                  </table>
                  <Link to="/room-details/4" className="primary-btn">Chi Tiết</Link>
                </div>
              </div>
            </div>
            <div className="col-lg-4 col-md-6">
              <div className="room-item">
                <img src="/img/room/room-5.jpg" alt="" />
                <div className="ri-text">
                  <h4>Phòng Suite</h4>
                  <h3>9.950.000₫<span>/Đêm</span></h3>
                  <table>
                    <tbody>
                      <tr>
                        <td className="r-o">Diện Tích:</td>
                        <td>60 m²</td>
                      </tr>
                      <tr>
                        <td className="r-o">Sức Chứa:</td>
                        <td>Tối đa 5 người</td>
                      </tr>
                      <tr>
                        <td className="r-o">Giường:</td>
                        <td>Giường King + Sofa</td>
                      </tr>
                      <tr>
                        <td className="r-o">Dịch Vụ:</td>
                        <td>Wifi, TV, Phòng Tắm, Bếp,...</td>
                      </tr>
                    </tbody>
                  </table>
                  <Link to="/room-details/5" className="primary-btn">Chi Tiết</Link>
                </div>
              </div>
            </div>
            <div className="col-lg-4 col-md-6">
              <div className="room-item">
                <img src="/img/room/room-6.jpg" alt="" />
                <div className="ri-text">
                  <h4>Phòng VIP</h4>
                  <h3>12.975.000₫<span>/Đêm</span></h3>
                  <table>
                    <tbody>
                      <tr>
                        <td className="r-o">Diện Tích:</td>
                        <td>80 m²</td>
                      </tr>
                      <tr>
                        <td className="r-o">Sức Chứa:</td>
                        <td>Tối đa 6 người</td>
                      </tr>
                      <tr>
                        <td className="r-o">Giường:</td>
                        <td>2 Giường King</td>
                      </tr>
                      <tr>
                        <td className="r-o">Dịch Vụ:</td>
                        <td>Tất cả tiện nghi cao cấp</td>
                      </tr>
                    </tbody>
                  </table>
                  <Link to="/room-details/6" className="primary-btn">Chi Tiết</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Rooms Section End */}
    </>
  );
};

export default RoomsPage;
