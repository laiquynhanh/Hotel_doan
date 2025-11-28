import { useState, useEffect } from 'react';
import { adminService } from '../../services/admin.service';
import type { FoodOrder } from '../../types/food.types';
import { FoodOrderStatus } from '../../types/food.types';
import { formatPrice } from '../../utils/currency';
import '../../styles/admin/FoodOrdersManagement.css';

const FoodOrdersManagement = () => {
  const [orders, setOrders] = useState<FoodOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<FoodOrderStatus | 'ALL'>('ALL');
  const [selectedOrder, setSelectedOrder] = useState<FoodOrder | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await adminService.getAllFoodOrders();
      setOrders(data);
    } catch (error) {
      console.error('Error loading orders:', error);
      alert('Không thể tải danh sách đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId: number, newStatus: FoodOrderStatus) => {
    if (!window.confirm(`Xác nhận cập nhật trạng thái đơn hàng #${orderId}?`)) {
      return;
    }

    try {
      await adminService.updateFoodOrderStatus(orderId, newStatus);
      alert('Cập nhật trạng thái thành công');
      loadOrders();
      if (selectedOrder && selectedOrder.id === orderId) {
        setShowModal(false);
        setSelectedOrder(null);
      }
    } catch (error: any) {
      console.error('Error updating order status:', error);
      alert(error.response?.data || 'Không thể cập nhật trạng thái');
    }
  };

  const handleViewDetails = (order: FoodOrder) => {
    setSelectedOrder(order);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedOrder(null);
  };

  const getStatusBadgeClass = (status: FoodOrderStatus): string => {
    switch (status) {
      case 'PENDING': return 'bg-warning';
      case 'CONFIRMED': return 'bg-info';
      case 'PREPARING': return 'bg-primary';
      case 'DELIVERING': return 'bg-secondary';
      case 'DELIVERED': return 'bg-success';
      case 'CANCELLED': return 'bg-danger';
      default: return 'bg-secondary';
    }
  };

  const getStatusText = (status: FoodOrderStatus): string => {
    const statusMap: Record<FoodOrderStatus, string> = {
      PENDING: 'Chờ xác nhận',
      CONFIRMED: 'Đã xác nhận',
      PREPARING: 'Đang chuẩn bị',
      DELIVERING: 'Đang giao',
      DELIVERED: 'Đã giao',
      CANCELLED: 'Đã hủy'
    };
    return statusMap[status] || status;
  };

  const filteredOrders = filterStatus === 'ALL'
    ? orders
    : orders.filter(order => order.status === filterStatus);

  const statuses: Array<FoodOrderStatus | 'ALL'> = ['ALL', FoodOrderStatus.PENDING, FoodOrderStatus.CONFIRMED, FoodOrderStatus.PREPARING, FoodOrderStatus.DELIVERING, FoodOrderStatus.DELIVERED, FoodOrderStatus.CANCELLED];

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
    <div className="food-orders-management">
      <h3 className="mb-4">Quản Lý Đơn Hàng Thức Ăn</h3>

      {/* Status Filter */}
      <div className="status-filters mb-4">
        {statuses.map(status => (
          <button
            key={status}
            className={`btn ${filterStatus === status ? 'btn-primary' : 'btn-outline-primary'} me-2 mb-2`}
            onClick={() => setFilterStatus(status)}
          >
            {status === 'ALL' ? 'Tất cả' : getStatusText(status)}
          </button>
        ))}
      </div>

      {/* Orders Table */}
      <div className="card">
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Mã ĐH</th>
                  <th>Khách hàng</th>
                  <th>Phòng</th>
                  <th>Thời gian</th>
                  <th>Tổng tiền</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map(order => (
                  <tr key={order.id}>
                    <td><strong>#{order.id}</strong></td>
                    <td>{order.userName}</td>
                    <td>{order.roomNumber || 'N/A'}</td>
                    <td>
                      <small>{new Date(order.orderTime).toLocaleString('vi-VN')}</small>
                    </td>
                    <td><strong className="text-primary">{formatPrice(order.totalPrice)}</strong></td>
                    <td>
                      <span className={`badge ${getStatusBadgeClass(order.status)}`}>
                        {getStatusText(order.status)}
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn btn-sm btn-info me-2"
                        onClick={() => handleViewDetails(order)}
                      >
                        <i className="fa fa-eye"></i> Chi tiết
                      </button>
                      {order.status !== FoodOrderStatus.DELIVERED && order.status !== FoodOrderStatus.CANCELLED && (
                        <div className="btn-group">
                          <button
                            type="button"
                            className="btn btn-sm btn-success dropdown-toggle"
                            data-bs-toggle="dropdown"
                          >
                            Cập nhật
                          </button>
                          <ul className="dropdown-menu">
                            {order.status === FoodOrderStatus.PENDING && (
                              <>
                                <li>
                                  <button
                                    className="dropdown-item"
                                    onClick={() => handleUpdateStatus(order.id, FoodOrderStatus.CONFIRMED)}
                                  >
                                    ✓ Xác nhận
                                  </button>
                                </li>
                                <li>
                                  <button
                                    className="dropdown-item text-danger"
                                    onClick={() => handleUpdateStatus(order.id, FoodOrderStatus.CANCELLED)}
                                  >
                                    ✗ Hủy
                                  </button>
                                </li>
                              </>
                            )}
                            {order.status === FoodOrderStatus.CONFIRMED && (
                              <li>
                                <button
                                  className="dropdown-item"
                                  onClick={() => handleUpdateStatus(order.id, FoodOrderStatus.PREPARING)}
                                >
                                  🍳 Đang chuẩn bị
                                </button>
                              </li>
                            )}
                            {order.status === FoodOrderStatus.PREPARING && (
                              <li>
                                <button
                                  className="dropdown-item"
                                  onClick={() => handleUpdateStatus(order.id, FoodOrderStatus.DELIVERING)}
                                >
                                  🚚 Đang giao
                                </button>
                              </li>
                            )}
                            {order.status === FoodOrderStatus.DELIVERING && (
                              <li>
                                <button
                                  className="dropdown-item"
                                  onClick={() => handleUpdateStatus(order.id, FoodOrderStatus.DELIVERED)}
                                >
                                  ✅ Đã giao
                                </button>
                              </li>
                            )}
                          </ul>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredOrders.length === 0 && (
              <div className="text-center py-4 text-muted">
                Không có đơn hàng nào
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Order Details Modal */}
      {showModal && selectedOrder && (
        <div className="modal fade show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Chi tiết đơn hàng #{selectedOrder.id}</h5>
                <button type="button" className="btn-close" onClick={handleCloseModal}></button>
              </div>
              <div className="modal-body">
                <div className="row mb-3">
                  <div className="col-md-6">
                    <strong>Khách hàng:</strong> {selectedOrder.userName}
                  </div>
                  <div className="col-md-6">
                    <strong>Phòng:</strong> {selectedOrder.roomNumber || 'N/A'}
                  </div>
                </div>

                <div className="row mb-3">
                  <div className="col-md-6">
                    <strong>Thời gian đặt:</strong> {new Date(selectedOrder.orderTime).toLocaleString('vi-VN')}
                  </div>
                  <div className="col-md-6">
                    <strong>Trạng thái:</strong>{' '}
                    <span className={`badge ${getStatusBadgeClass(selectedOrder.status)}`}>
                      {getStatusText(selectedOrder.status)}
                    </span>
                  </div>
                </div>

                {selectedOrder.specialInstructions && (
                  <div className="mb-3">
                    <strong>Ghi chú:</strong>
                    <p className="text-muted mb-0">{selectedOrder.specialInstructions}</p>
                  </div>
                )}

                <hr />

                <h6>Món ăn đã đặt:</h6>
                <table className="table table-sm">
                  <thead>
                    <tr>
                      <th>Món</th>
                      <th>Số lượng</th>
                      <th>Đơn giá</th>
                      <th>Thành tiền</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOrder.items.map((item, index) => (
                      <tr key={index}>
                        <td>{item.foodItemName}</td>
                        <td>{item.quantity}</td>
                        <td>{formatPrice(item.price)}</td>
                        <td><strong>{formatPrice(item.price * item.quantity)}</strong></td>
                      </tr>
                    ))}
                    <tr className="table-primary">
                      <td colSpan={3} className="text-end"><strong>Tổng cộng:</strong></td>
                      <td><strong className="text-primary">{formatPrice(selectedOrder.totalPrice)}</strong></td>
                    </tr>
                  </tbody>
                </table>

                {selectedOrder.deliveredAt && (
                  <div className="alert alert-success mt-3">
                    <i className="fa fa-check-circle me-2"></i>
                    Đã giao lúc: {new Date(selectedOrder.deliveredAt).toLocaleString('vi-VN')}
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FoodOrdersManagement;
