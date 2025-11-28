import { useState, useEffect } from 'react';
import { foodService } from '../services/food.service';
import type { FoodOrder, FoodOrderStatus } from '../types/food.types';
import { formatPrice } from '../utils/currency';
import '../styles/MyFoodOrdersPage.css';

const MyFoodOrdersPage = () => {
  const [orders, setOrders] = useState<FoodOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<number | null>(null);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await foodService.getMyOrders();
      setOrders(data);
    } catch (error) {
      console.error('Error loading orders:', error);
      alert('Không thể tải danh sách đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (orderId: number) => {
    if (!window.confirm('Bạn có chắc muốn hủy đơn hàng này?')) {
      return;
    }

    try {
      setCancellingId(orderId);
      await foodService.cancelOrder(orderId);
      alert('Đã hủy đơn hàng thành công');
      loadOrders();
    } catch (error: any) {
      console.error('Error cancelling order:', error);
      alert(error.response?.data || 'Không thể hủy đơn hàng');
    } finally {
      setCancellingId(null);
    }
  };

  const getStatusBadgeClass = (status: FoodOrderStatus): string => {
    switch (status) {
      case 'PENDING':
        return 'bg-warning';
      case 'CONFIRMED':
        return 'bg-info';
      case 'PREPARING':
        return 'bg-primary';
      case 'DELIVERING':
        return 'bg-secondary';
      case 'DELIVERED':
        return 'bg-success';
      case 'CANCELLED':
        return 'bg-danger';
      default:
        return 'bg-secondary';
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

  if (loading) {
    return (
      <div className="container text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="my-food-orders-page">
      <div className="container my-5">
        <h2 className="text-center mb-4">Đơn Hàng Của Tôi</h2>

        {orders.length === 0 ? (
          <div className="text-center py-5">
            <i className="fa fa-shopping-cart fa-3x text-muted mb-3"></i>
            <p className="text-muted">Bạn chưa có đơn hàng nào</p>
            <a href="/room-service" className="btn btn-primary">Đặt Món Ngay</a>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map(order => (
              <div key={order.id} className="order-card card mb-3">
                <div className="card-header d-flex justify-content-between align-items-center">
                  <div>
                    <strong>Đơn #{order.id}</strong>
                    <small className="text-muted ms-3">
                      {new Date(order.createdAt).toLocaleString('vi-VN')}
                    </small>
                  </div>
                  <span className={`badge ${getStatusBadgeClass(order.status)}`}>
                    {getStatusText(order.status)}
                  </span>
                </div>
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-8">
                      <h6>Chi tiết đơn hàng:</h6>
                      <ul className="order-items-list">
                        {order.items.map(item => (
                          <li key={item.id}>
                            <span className="item-name">{item.foodItemName}</span>
                            <span className="item-quantity">x{item.quantity}</span>
                            <span className="item-price">{formatPrice(item.price * item.quantity)}</span>
                          </li>
                        ))}
                      </ul>

                      <div className="order-details mt-3">
                        <div><strong>Phòng:</strong> {order.roomNumber}</div>
                        {order.specialInstructions && (
                          <div><strong>Ghi chú:</strong> {order.specialInstructions}</div>
                        )}
                        {order.deliveredAt && (
                          <div><strong>Đã giao:</strong> {new Date(order.deliveredAt).toLocaleString('vi-VN')}</div>
                        )}
                      </div>
                    </div>

                    <div className="col-md-4 text-end">
                      <div className="order-total mb-3">
                        <div className="text-muted">Tổng cộng</div>
                        <h4 className="text-primary">{formatPrice(order.totalPrice)}</h4>
                      </div>

                      {order.status === 'PENDING' && (
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleCancelOrder(order.id)}
                          disabled={cancellingId === order.id}
                        >
                          {cancellingId === order.id ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2"></span>
                              Đang hủy...
                            </>
                          ) : (
                            <>
                              <i className="fa fa-times me-2"></i>
                              Hủy Đơn
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyFoodOrdersPage;
