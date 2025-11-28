import { useState, useEffect } from 'react';
import { adminService } from '../../services/admin.service';
import { roomService } from '../../services/room.service';
import type { Room, RoomType, RoomStatus } from '../../types/room.types';

const RoomManagement = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [roomFormData, setRoomFormData] = useState<Partial<Room>>({
    roomNumber: '',
    roomType: 'STANDARD' as RoomType,
    pricePerNight: 0,
    capacity: 1,
    size: 0,
    description: '',
    amenities: '',
    status: 'AVAILABLE' as RoomStatus,
    imageUrl: ''
  });

  useEffect(() => {
    loadRooms();
  }, []);

  const loadRooms = async () => {
    try {
      setLoading(true);
      const data = await adminService.getAllRooms();
      setRooms(data);
      setError('');
    } catch (err: any) {
      setError('Không thể tải danh sách phòng');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreateRoom = () => {
    setEditingRoom(null);
    setRoomFormData({
      roomNumber: '',
      roomType: 'STANDARD' as RoomType,
      pricePerNight: 0,
      capacity: 1,
      size: 0,
      description: '',
      amenities: '',
      status: 'AVAILABLE' as RoomStatus,
      imageUrl: ''
    });
    setShowRoomModal(true);
  };

  const handleOpenEditRoom = (room: Room) => {
    setEditingRoom(room);
    setRoomFormData({
      roomNumber: room.roomNumber,
      roomType: room.roomType,
      pricePerNight: room.pricePerNight,
      capacity: room.capacity,
      size: room.size,
      description: room.description,
      amenities: room.amenities,
      status: room.status,
      imageUrl: room.imageUrl
    });
    setShowRoomModal(true);
  };

  const handleCloseRoomModal = () => {
    setShowRoomModal(false);
    setEditingRoom(null);
  };

  const handleRoomFormChange = (field: keyof Room, value: any) => {
    setRoomFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveRoom = async () => {
    try {
      if (editingRoom) {
        await roomService.updateRoom(editingRoom.id, roomFormData);
        alert('Đã cập nhật phòng thành công!');
      } else {
        await roomService.createRoom(roomFormData);
        alert('Đã tạo phòng mới thành công!');
      }
      handleCloseRoomModal();
      loadRooms();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Không thể lưu phòng');
    }
  };

  const handleDeleteRoom = async (id: number) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa phòng này?')) return;
    try {
      await roomService.deleteRoom(id);
      alert('Đã xóa phòng thành công!');
      loadRooms();
    } catch (err: any) {
      alert('Không thể xóa phòng');
    }
  };

  if (loading) {
    return <div className="text-center py-5"><div className="spinner-border"></div></div>;
  }

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  return (
    <div className="rooms-tab">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Quản Lý Phòng</h2>
        <button className="btn btn-primary" onClick={handleOpenCreateRoom}>
          <i className="fa fa-plus me-2"></i>Thêm Phòng Mới
        </button>
      </div>
      
      {/* Search Bar */}
      <div className="mb-3">
        <div className="input-group">
          <span className="input-group-text">
            <i className="fa fa-search"></i>
          </span>
          <input
            type="text"
            className="form-control"
            placeholder="Tìm kiếm theo số phòng, loại phòng, trạng thái..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="table-responsive mt-4">
        <table className="table table-hover">
          <thead>
            <tr>
              <th>ID</th>
              <th>Số Phòng</th>
              <th>Loại</th>
              <th>Giá/Đêm</th>
              <th>Sức Chứa</th>
              <th>Diện Tích</th>
              <th>Trạng Thái</th>
              <th>Thao Tác</th>
            </tr>
          </thead>
          <tbody>
            {rooms
              .filter((room) => {
                if (!searchQuery) return true;
                const query = searchQuery.toLowerCase();
                return (
                  room.roomNumber.toLowerCase().includes(query) ||
                  room.roomType.toLowerCase().includes(query) ||
                  room.status.toLowerCase().includes(query) ||
                  room.id.toString().includes(query)
                );
              })
              .map((room) => (
              <tr key={room.id}>
                <td>{room.id}</td>
                <td>{room.roomNumber}</td>
                <td>{room.roomType}</td>
                <td>{room.pricePerNight.toLocaleString('vi-VN')} VNĐ</td>
                <td>{room.capacity} người</td>
                <td>{room.size}m²</td>
                <td>
                  <span className={`badge ${
                    room.status === 'AVAILABLE' ? 'bg-success' : 
                    room.status === 'OCCUPIED' ? 'bg-danger' : 'bg-warning'
                  }`}>
                    {room.status}
                  </span>
                </td>
                <td>
                  <button 
                    className="btn btn-sm btn-warning me-2"
                    onClick={() => handleOpenEditRoom(room)}
                  >
                    <i className="fa fa-edit"></i> Sửa
                  </button>
                  <button 
                    className="btn btn-sm btn-danger"
                    onClick={() => handleDeleteRoom(room.id)}
                  >
                    <i className="fa fa-trash"></i> Xóa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Room Modal */}
      {showRoomModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editingRoom ? 'Chỉnh Sửa Phòng' : 'Thêm Phòng Mới'}
                </h5>
                <button type="button" className="btn-close" onClick={handleCloseRoomModal}></button>
              </div>
              <div className="modal-body">
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label">Số Phòng *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={roomFormData.roomNumber || ''}
                      onChange={(e) => handleRoomFormChange('roomNumber', e.target.value)}
                      placeholder="VD: 101"
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Loại Phòng *</label>
                    <select
                      className="form-control"
                      value={roomFormData.roomType || 'STANDARD'}
                      onChange={(e) => handleRoomFormChange('roomType', e.target.value as RoomType)}
                    >
                      <option value="SINGLE">Đơn</option>
                      <option value="DOUBLE">Đôi</option>
                      <option value="DELUXE">Cao Cấp</option>
                      <option value="SUITE">Suite</option>
                      <option value="FAMILY">Gia Đình</option>
                      <option value="PREMIUM">Premium</option>
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Giá/Đêm (VNĐ) *</label>
                    <input
                      type="number"
                      className="form-control"
                      value={roomFormData.pricePerNight || 0}
                      onChange={(e) => handleRoomFormChange('pricePerNight', Number(e.target.value))}
                      min="0"
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Sức Chứa (người) *</label>
                    <input
                      type="number"
                      className="form-control"
                      value={roomFormData.capacity || 1}
                      onChange={(e) => handleRoomFormChange('capacity', Number(e.target.value))}
                      min="1"
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Diện Tích (m²) *</label>
                    <input
                      type="number"
                      className="form-control"
                      value={roomFormData.size || 0}
                      onChange={(e) => handleRoomFormChange('size', Number(e.target.value))}
                      min="0"
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Trạng Thái *</label>
                    <select
                      className="form-control"
                      value={roomFormData.status || 'AVAILABLE'}
                      onChange={(e) => handleRoomFormChange('status', e.target.value as RoomStatus)}
                    >
                      <option value="AVAILABLE">Có Sẵn</option>
                      <option value="OCCUPIED">Đang Sử Dụng</option>
                      <option value="MAINTENANCE">Bảo Trì</option>
                      <option value="CLEANING">Dọn Dẹp</option>
                    </select>
                  </div>
                  <div className="col-12">
                    <label className="form-label">Mô Tả</label>
                    <textarea
                      className="form-control"
                      rows={3}
                      value={roomFormData.description || ''}
                      onChange={(e) => handleRoomFormChange('description', e.target.value)}
                      placeholder="Mô tả chi tiết về phòng..."
                    ></textarea>
                  </div>
                  <div className="col-12">
                    <label className="form-label">Tiện Nghi</label>
                    <input
                      type="text"
                      className="form-control"
                      value={roomFormData.amenities || ''}
                      onChange={(e) => handleRoomFormChange('amenities', e.target.value)}
                      placeholder="VD: WiFi, TV, Máy lạnh, Tủ lạnh..."
                    />
                  </div>
                  <div className="col-12">
                    <label className="form-label">Hình Ảnh Phòng</label>
                    
                    {/* Preview hình ảnh */}
                    {roomFormData.imageUrl && (
                      <div className="image-preview mb-3">
                        <img 
                          src={roomFormData.imageUrl} 
                          alt="Preview" 
                          style={{ maxWidth: '200px', maxHeight: '150px', objectFit: 'cover', borderRadius: '8px' }}
                        />
                      </div>
                    )}
                    
                    {/* Chọn từ thư viện ảnh có sẵn */}
                    <div className="mb-2">
                      <label className="form-label small text-muted">Chọn từ thư viện:</label>
                      <div className="row g-2">
                        {[
                          '/img/room/room-1.jpg',
                          '/img/room/room-2.jpg',
                          '/img/room/room-3.jpg',
                          '/img/room/room-4.jpg',
                          '/img/room/room-b1.jpg',
                          '/img/room/room-b2.jpg',
                          '/img/room/room-b3.jpg',
                          '/img/room/room-b4.jpg'
                        ].map((url) => (
                          <div key={url} className="col-3">
                            <img
                              src={url}
                              alt="Room"
                              onClick={() => handleRoomFormChange('imageUrl', url)}
                              style={{
                                width: '100%',
                                height: '80px',
                                objectFit: 'cover',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                border: roomFormData.imageUrl === url ? '3px solid #dfa974' : '1px solid #ddd',
                                transition: 'all 0.2s'
                              }}
                              onMouseOver={(e) => {
                                if (roomFormData.imageUrl !== url) {
                                  e.currentTarget.style.border = '2px solid #dfa974';
                                }
                              }}
                              onMouseOut={(e) => {
                                if (roomFormData.imageUrl !== url) {
                                  e.currentTarget.style.border = '1px solid #ddd';
                                }
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Hoặc nhập URL tùy chỉnh */}
                    <div>
                      <label className="form-label small text-muted">Hoặc nhập URL:</label>
                      <input
                        type="text"
                        className="form-control"
                        value={roomFormData.imageUrl || ''}
                        onChange={(e) => handleRoomFormChange('imageUrl', e.target.value)}
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={handleCloseRoomModal}>
                  Hủy
                </button>
                <button type="button" className="btn btn-primary" onClick={handleSaveRoom}>
                  {editingRoom ? 'Cập Nhật' : 'Tạo Mới'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomManagement;
