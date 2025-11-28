import { useState, useEffect } from 'react';
import { adminService } from '../../services/admin.service';
import type { RestaurantTable } from '../../types/restaurant.types';
import { TableStatus } from '../../types/restaurant.types';
import '../../styles/admin/RestaurantTablesManagement.css';

const RestaurantTablesManagement = () => {
  const [tables, setTables] = useState<RestaurantTable[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTable, setEditingTable] = useState<RestaurantTable | null>(null);
  const [formData, setFormData] = useState({
    tableNumber: '',
    capacity: '',
    location: '',
    status: TableStatus.AVAILABLE
  });

  useEffect(() => {
    loadTables();
  }, []);

  const loadTables = async () => {
    try {
      setLoading(true);
      const data = await adminService.getAllRestaurantTables();
      setTables(data);
    } catch (error) {
      console.error('Error loading tables:', error);
      alert('Không thể tải danh sách bàn');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (table?: RestaurantTable) => {
    if (table) {
      setEditingTable(table);
      setFormData({
        tableNumber: table.tableNumber,
        capacity: table.capacity.toString(),
        location: table.location,
        status: table.status
      });
    } else {
      setEditingTable(null);
      setFormData({
        tableNumber: '',
        capacity: '',
        location: '',
        status: TableStatus.AVAILABLE
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingTable(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.tableNumber || !formData.capacity || !formData.location) {
      alert('Vui lòng điền đầy đủ thông tin');
      return;
    }

    try {
      const tableData = {
        ...formData,
        capacity: parseInt(formData.capacity)
      };

      if (editingTable) {
        await adminService.updateRestaurantTable(editingTable.id, tableData);
        alert('Cập nhật bàn thành công');
      } else {
        await adminService.createRestaurantTable(tableData);
        alert('Thêm bàn thành công');
      }

      handleCloseModal();
      loadTables();
    } catch (error: any) {
      console.error('Error saving table:', error);
      alert(error.response?.data || 'Không thể lưu thông tin bàn');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Bạn có chắc muốn xóa bàn này?')) {
      return;
    }

    try {
      await adminService.deleteRestaurantTable(id);
      alert('Xóa bàn thành công');
      loadTables();
    } catch (error: any) {
      console.error('Error deleting table:', error);
      alert(error.response?.data || 'Không thể xóa bàn');
    }
  };

  const getStatusBadgeClass = (status: TableStatus): string => {
    switch (status) {
      case TableStatus.AVAILABLE: return 'bg-success';
      case TableStatus.OCCUPIED: return 'bg-danger';
      case TableStatus.RESERVED: return 'bg-warning';
      case TableStatus.MAINTENANCE: return 'bg-secondary';
      default: return 'bg-secondary';
    }
  };

  const getStatusText = (status: TableStatus): string => {
    const statusMap: Record<TableStatus, string> = {
      [TableStatus.AVAILABLE]: 'Còn trống',
      [TableStatus.OCCUPIED]: 'Đang sử dụng',
      [TableStatus.RESERVED]: 'Đã đặt',
      [TableStatus.MAINTENANCE]: 'Bảo trì'
    };
    return statusMap[status] || status;
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="restaurant-tables-management">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3>Quản Lý Bàn Ăn</h3>
        <button className="btn btn-primary" onClick={() => handleOpenModal()}>
          <i className="fa fa-plus me-2"></i>Thêm Bàn Mới
        </button>
      </div>

      {/* Tables Grid */}
      <div className="row g-3">
        {tables.map(table => (
          <div key={table.id} className="col-md-4 col-lg-3">
            <div className="card table-card">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <h5 className="card-title mb-0">{table.tableNumber}</h5>
                  <span className={`badge ${getStatusBadgeClass(table.status)}`}>
                    {getStatusText(table.status)}
                  </span>
                </div>
                <p className="card-text">
                  <i className="fa fa-users me-2"></i>{table.capacity} người<br />
                  <i className="fa fa-map-marker me-2"></i>{table.location}
                </p>
                <div className="btn-group w-100">
                  <button
                    className="btn btn-sm btn-warning"
                    onClick={() => handleOpenModal(table)}
                  >
                    <i className="fa fa-edit"></i> Sửa
                  </button>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => handleDelete(table.id)}
                  >
                    <i className="fa fa-trash"></i> Xóa
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {tables.length === 0 && (
        <div className="text-center py-5 text-muted">
          Chưa có bàn nào
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal fade show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editingTable ? 'Chỉnh sửa bàn' : 'Thêm bàn mới'}
                </h5>
                <button type="button" className="btn-close" onClick={handleCloseModal}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Số bàn *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.tableNumber}
                      onChange={(e) => setFormData({ ...formData, tableNumber: e.target.value })}
                      placeholder="VD: T01, T02"
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Sức chứa *</label>
                    <input
                      type="number"
                      className="form-control"
                      value={formData.capacity}
                      onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                      min="1"
                      max="20"
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Vị trí *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="VD: Cạnh cửa sổ, VIP, Trung tâm"
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Trạng thái *</label>
                    <select
                      className="form-select"
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as TableStatus })}
                      required
                    >
                      <option value={TableStatus.AVAILABLE}>Còn trống</option>
                      <option value={TableStatus.OCCUPIED}>Đang sử dụng</option>
                      <option value={TableStatus.RESERVED}>Đã đặt</option>
                      <option value={TableStatus.MAINTENANCE}>Bảo trì</option>
                    </select>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
                    Hủy
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {editingTable ? 'Cập nhật' : 'Thêm mới'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RestaurantTablesManagement;
