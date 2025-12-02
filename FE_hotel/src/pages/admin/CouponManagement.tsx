import { useState, useEffect } from 'react';
import { adminService } from '../../services/admin.service';
import '../../styles/admin/CouponManagement.css';

interface Coupon {
  id: number;
  code: string;
  description: string;
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
  discountValue: number;
  minOrderAmount?: number;
  maxDiscountAmount?: number;
  usageLimit?: number;
  usedCount: number;
  validFrom: string;
  validUntil: string;
  active: boolean;
  createdAt: string;
}

const CouponManagement = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discountType: 'PERCENTAGE' as 'PERCENTAGE' | 'FIXED_AMOUNT',
    discountValue: 0,
    minOrderAmount: 0,
    maxDiscountAmount: 0,
    usageLimit: 0,
    validFrom: '',
    validUntil: '',
    active: true
  });

  useEffect(() => {
    loadCoupons();
  }, []);

  const loadCoupons = async () => {
    try {
      setLoading(true);
      const data = await adminService.getAllCoupons();
      setCoupons(data);
    } catch (err) {
      alert('Không thể tải danh sách mã giảm giá');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (coupon?: Coupon) => {
    if (coupon) {
      setEditingCoupon(coupon);
      setFormData({
        code: coupon.code,
        description: coupon.description,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        minOrderAmount: coupon.minOrderAmount || 0,
        maxDiscountAmount: coupon.maxDiscountAmount || 0,
        usageLimit: coupon.usageLimit || 0,
        validFrom: coupon.validFrom.slice(0, 16),
        validUntil: coupon.validUntil.slice(0, 16),
        active: coupon.active
      });
    } else {
      setEditingCoupon(null);
      setFormData({
        code: '',
        description: '',
        discountType: 'PERCENTAGE',
        discountValue: 10,
        minOrderAmount: 0,
        maxDiscountAmount: 0,
        usageLimit: 0,
        validFrom: new Date().toISOString().slice(0, 16),
        validUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
        active: true
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCoupon(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCoupon) {
        await adminService.updateCoupon(editingCoupon.id, {
          ...formData,
          validFrom: new Date(formData.validFrom).toISOString(),
          validUntil: new Date(formData.validUntil).toISOString()
        });
        alert('Cập nhật mã giảm giá thành công!');
      } else {
        await adminService.createCoupon({
          ...formData,
          validFrom: new Date(formData.validFrom).toISOString(),
          validUntil: new Date(formData.validUntil).toISOString()
        });
        alert('Tạo mã giảm giá thành công!');
      }
      handleCloseModal();
      loadCoupons();
    } catch (err: any) {
      alert(err?.response?.data || 'Có lỗi xảy ra');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Bạn có chắc muốn xóa mã giảm giá này?')) return;
    try {
      await adminService.deleteCoupon(id);
      alert('Đã xóa mã giảm giá');
      loadCoupons();
    } catch (err) {
      alert('Không thể xóa mã giảm giá');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN');
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('vi-VN') + 'đ';
  };

  if (loading) {
    return <div className="text-center py-5"><div className="spinner-border"></div></div>;
  }

  return (
    <div className="coupon-management">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Quản Lý Mã Giảm Giá</h2>
        <button className="btn btn-primary" onClick={() => handleOpenModal()}>
          <i className="fa fa-plus"></i> Tạo Mã Giảm Giá
        </button>
      </div>

      <div className="table-responsive">
        <table className="table table-hover">
          <thead>
            <tr>
              <th>Mã</th>
              <th>Mô tả</th>
              <th>Loại</th>
              <th>Giá trị</th>
              <th>Đơn tối thiểu</th>
              <th>Giới hạn SD</th>
              <th>Đã dùng</th>
              <th>Hiệu lực</th>
              <th>Trạng thái</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {coupons.map(coupon => (
              <tr key={coupon.id}>
                <td><strong className="text-primary">{coupon.code}</strong></td>
                <td>{coupon.description}</td>
                <td>
                  {coupon.discountType === 'PERCENTAGE' ? (
                    <span className="badge bg-info">Phần trăm</span>
                  ) : (
                    <span className="badge bg-success">Số tiền</span>
                  )}
                </td>
                <td>
                  {coupon.discountType === 'PERCENTAGE' 
                    ? `${coupon.discountValue}%` 
                    : formatCurrency(coupon.discountValue)}
                </td>
                <td>{coupon.minOrderAmount ? formatCurrency(coupon.minOrderAmount) : '-'}</td>
                <td>{coupon.usageLimit || 'Không giới hạn'}</td>
                <td>{coupon.usedCount}</td>
                <td>
                  <small>
                    {formatDate(coupon.validFrom)}<br/>
                    đến<br/>
                    {formatDate(coupon.validUntil)}
                  </small>
                </td>
                <td>
                  {coupon.active ? (
                    <span className="badge bg-success">Hoạt động</span>
                  ) : (
                    <span className="badge bg-secondary">Tắt</span>
                  )}
                </td>
                <td>
                  <button 
                    className="btn btn-sm btn-warning me-2"
                    onClick={() => handleOpenModal(coupon)}
                  >
                    <i className="fa fa-edit"></i>
                  </button>
                  <button 
                    className="btn btn-sm btn-danger"
                    onClick={() => handleDelete(coupon.id)}
                  >
                    <i className="fa fa-trash"></i>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editingCoupon ? 'Chỉnh Sửa Mã Giảm Giá' : 'Tạo Mã Giảm Giá Mới'}
                </h5>
                <button type="button" className="btn-close" onClick={handleCloseModal}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label">Mã giảm giá *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.code}
                        onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                        disabled={!!editingCoupon}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Loại giảm giá *</label>
                      <select
                        className="form-select"
                        value={formData.discountType}
                        onChange={(e) => setFormData({...formData, discountType: e.target.value as any})}
                        required
                      >
                        <option value="PERCENTAGE">Phần trăm (%)</option>
                        <option value="FIXED_AMOUNT">Số tiền cố định (đ)</option>
                      </select>
                    </div>
                    <div className="col-12">
                      <label className="form-label">Mô tả *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">
                        Giá trị giảm *
                        {formData.discountType === 'PERCENTAGE' && ' (1-100%)'}
                      </label>
                      <input
                        type="number"
                        className="form-control"
                        value={formData.discountValue}
                        onChange={(e) => setFormData({...formData, discountValue: Number(e.target.value)})}
                        min={0}
                        max={formData.discountType === 'PERCENTAGE' ? 100 : undefined}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Đơn hàng tối thiểu (đ)</label>
                      <input
                        type="number"
                        className="form-control"
                        value={formData.minOrderAmount}
                        onChange={(e) => setFormData({...formData, minOrderAmount: Number(e.target.value)})}
                        min={0}
                      />
                    </div>
                    {formData.discountType === 'PERCENTAGE' && (
                      <div className="col-md-6">
                        <label className="form-label">Giảm tối đa (đ)</label>
                        <input
                          type="number"
                          className="form-control"
                          value={formData.maxDiscountAmount}
                          onChange={(e) => setFormData({...formData, maxDiscountAmount: Number(e.target.value)})}
                          min={0}
                        />
                      </div>
                    )}
                    <div className="col-md-6">
                      <label className="form-label">Giới hạn số lần dùng (0 = không giới hạn)</label>
                      <input
                        type="number"
                        className="form-control"
                        value={formData.usageLimit}
                        onChange={(e) => setFormData({...formData, usageLimit: Number(e.target.value)})}
                        min={0}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Hiệu lực từ *</label>
                      <input
                        type="datetime-local"
                        className="form-control"
                        value={formData.validFrom}
                        onChange={(e) => setFormData({...formData, validFrom: e.target.value})}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Hiệu lực đến *</label>
                      <input
                        type="datetime-local"
                        className="form-control"
                        value={formData.validUntil}
                        onChange={(e) => setFormData({...formData, validUntil: e.target.value})}
                        required
                      />
                    </div>
                    <div className="col-12">
                      <div className="form-check">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          checked={formData.active}
                          onChange={(e) => setFormData({...formData, active: e.target.checked})}
                        />
                        <label className="form-check-label">Kích hoạt</label>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
                    Hủy
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {editingCoupon ? 'Cập nhật' : 'Tạo mới'}
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

export default CouponManagement;
