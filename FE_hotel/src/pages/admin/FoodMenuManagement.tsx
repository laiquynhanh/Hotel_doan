import { useState, useEffect, useMemo, useCallback } from 'react';
import { adminService } from '../../services/admin.service';
import type { FoodItem } from '../../types/food.types';
import { FoodCategory } from '../../types/food.types';
import { formatPrice } from '../../utils/currency';
import '../../styles/admin/FoodMenuManagement.css';
import { uploadService } from '../../services/upload.service';
import { showToast } from '../../utils/toast';

const FoodMenuManagement = () => {
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<FoodItem | null>(null);
  const [filterCategory, setFilterCategory] = useState<FoodCategory | 'ALL'>('ALL');
  const [formData, setFormData] = useState({
    name: '',
    category: FoodCategory.BREAKFAST,
    price: '',
    description: '',
    imageUrl: '',
    available: true
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const loadFoodItems = useCallback(async () => {
    try {
      setLoading(true);
      const data = await adminService.getAllFoodItems();
      setFoodItems(data);
    } catch (error: any) {
      console.error('Error loading food items:', error);
      showToast.error(error.response?.data?.message || 'Không thể tải danh sách món ăn');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFoodItems();
  }, [loadFoodItems]);

  const handleOpenModal = useCallback((item?: FoodItem) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        name: item.name,
        category: item.category,
        price: item.price.toString(),
        description: item.description,
        imageUrl: item.imageUrl,
        available: item.available
      });
      setImageFile(null);
    } else {
      setEditingItem(null);
      setFormData({
        name: '',
        category: FoodCategory.BREAKFAST,
        price: '',
        description: '',
        imageUrl: '',
        available: true
      });
      setImageFile(null);
    }
    setShowModal(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setShowModal(false);
    setEditingItem(null);
  }, []);

  const handleUploadImage = useCallback(async () => {
    if (!imageFile) {
      showToast.warning('Vui lòng chọn một file ảnh trước');
      return;
    }
    try {
      setUploading(true);
      const uploadPromise = uploadService.uploadImage(imageFile);
      const result = await showToast.promise(uploadPromise, {
        pending: 'Đang tải ảnh lên...',
        success: 'Tải ảnh thành công!',
        error: 'Không thể tải ảnh'
      });
      if (result && typeof result === 'object' && 'url' in result) {
        setFormData(prev => ({ ...prev, imageUrl: (result as { url: string }).url }));
      }
    } catch (error: any) {
      console.error('Upload error', error);
    } finally {
      setUploading(false);
    }
  }, [imageFile]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.price || !formData.description) {
      showToast.warning('Vui lòng điền đầy đủ thông tin');
      return;
    }

    try {
      const itemData = {
        ...formData,
        price: parseFloat(formData.price)
      };

      if (editingItem) {
        await adminService.updateFoodItem(editingItem.id, itemData);
        showToast.success('Cập nhật món ăn thành công');
      } else {
        await adminService.createFoodItem(itemData);
        showToast.success('Thêm món ăn thành công');
      }

      handleCloseModal();
      loadFoodItems();
    } catch (error: any) {
      console.error('Error saving food item:', error);
      showToast.error(error.response?.data?.message || 'Không thể lưu món ăn');
    }
  }, [formData, editingItem, handleCloseModal, loadFoodItems]);

  const handleDelete = useCallback(async (id: number) => {
    if (!window.confirm('Bạn có chắc muốn xóa món ăn này?')) {
      return;
    }

    try {
      await adminService.deleteFoodItem(id);
      showToast.success('Xóa món ăn thành công');
      loadFoodItems();
    } catch (error: any) {
      console.error('Error deleting food item:', error);
      showToast.error(error.response?.data?.message || 'Không thể xóa món ăn');
    }
  }, [loadFoodItems]);

  const handleToggleAvailability = useCallback(async (item: FoodItem) => {
    try {
      await adminService.updateFoodItem(item.id, {
        ...item,
        available: !item.available
      });
      showToast.success('Cập nhật trạng thái thành công');
      loadFoodItems();
    } catch (error: any) {
      console.error('Error toggling availability:', error);
      showToast.error(error.response?.data?.message || 'Không thể cập nhật trạng thái');
    }
  }, [loadFoodItems]);

  // Memoize filtered items để tránh re-filter mỗi render
  const filteredItems = useMemo(() => {
    return filterCategory === 'ALL'
      ? foodItems
      : foodItems.filter(item => item.category === filterCategory);
  }, [foodItems, filterCategory]);

  const categories: Array<FoodCategory | 'ALL'> = useMemo(() => 
    ['ALL', FoodCategory.BREAKFAST, FoodCategory.LUNCH, FoodCategory.DINNER, FoodCategory.DRINKS, FoodCategory.DESSERT],
    []
  );

  const categoryLabels: Record<FoodCategory | 'ALL', string> = useMemo(() => ({
    ALL: 'Tất cả',
    [FoodCategory.BREAKFAST]: 'Bữa sáng',
    [FoodCategory.LUNCH]: 'Bữa trưa',
    [FoodCategory.DINNER]: 'Bữa tối',
    [FoodCategory.DRINKS]: 'Đồ uống',
    [FoodCategory.DESSERT]: 'Tráng miệng'
  }), []);

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
    <div className="food-menu-management">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3>Quản Lý Thực Đơn</h3>
        <button className="btn btn-primary" onClick={() => handleOpenModal()}>
          <i className="fa fa-plus me-2"></i>Thêm Món Mới
        </button>
      </div>

      {/* Category Filter */}
      <div className="category-filters mb-4">
        {categories.map(cat => (
          <button
            key={cat}
            className={`btn ${filterCategory === cat ? 'btn-primary' : 'btn-outline-primary'} me-2 mb-2`}
            onClick={() => setFilterCategory(cat)}
          >
            {categoryLabels[cat]}
          </button>
        ))}
      </div>

      {/* Food Items Table */}
      <div className="card">
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Hình ảnh</th>
                  <th>Tên món</th>
                  <th>Danh mục</th>
                  <th>Giá</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map(item => (
                  <tr key={item.id}>
                    <td>
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="food-thumbnail"
                        onError={(e) => {
                          e.currentTarget.src = '/img/default-food.jpg';
                        }}
                      />
                    </td>
                    <td>
                      <strong>{item.name}</strong>
                      <br />
                      <small className="text-muted">{item.description}</small>
                    </td>
                    <td>{categoryLabels[item.category]}</td>
                    <td><strong>{formatPrice(item.price)}</strong></td>
                    <td>
                      <div className="form-check form-switch">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          checked={item.available}
                          onChange={() => handleToggleAvailability(item)}
                        />
                        <label className="form-check-label">
                          {item.available ? 'Còn món' : 'Hết món'}
                        </label>
                      </div>
                    </td>
                    <td>
                      <button
                        className="btn btn-sm btn-warning me-2"
                        onClick={() => handleOpenModal(item)}
                      >
                        <i className="fa fa-edit"></i>
                      </button>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDelete(item.id)}
                      >
                        <i className="fa fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredItems.length === 0 && (
              <div className="text-center py-4 text-muted">
                Không có món ăn nào
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal fade show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editingItem ? 'Chỉnh sửa món ăn' : 'Thêm món mới'}
                </h5>
                <button type="button" className="btn-close" onClick={handleCloseModal}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Tên món *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                    </div>

                    <div className="col-md-6 mb-3">
                      <label className="form-label">Danh mục *</label>
                      <select
                        className="form-select"
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value as FoodCategory })}
                        required
                      >
                        <option value="BREAKFAST">Bữa sáng</option>
                        <option value="LUNCH">Bữa trưa</option>
                        <option value="DINNER">Bữa tối</option>
                        <option value="DRINKS">Đồ uống</option>
                        <option value="DESSERT">Tráng miệng</option>
                      </select>
                    </div>

                    <div className="col-md-6 mb-3">
                      <label className="form-label">Giá (VNĐ) *</label>
                      <input
                        type="number"
                        className="form-control"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        required
                        min="0"
                        step="1000"
                      />
                    </div>

                    <div className="col-md-6 mb-3">
                      <label className="form-label">Trạng thái</label>
                      <div className="form-check form-switch mt-2">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          checked={formData.available}
                          onChange={(e) => setFormData({ ...formData, available: e.target.checked })}
                        />
                        <label className="form-check-label">
                          {formData.available ? 'Còn món' : 'Hết món'}
                        </label>
                      </div>
                    </div>

                    <div className="col-12 mb-3">
                      <label className="form-label">Mô tả *</label>
                      <textarea
                        className="form-control"
                        rows={3}
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        required
                      />
                    </div>

                    <div className="col-12 mb-3">
                      <label className="form-label">Hình ảnh món ăn</label>
                      <div className="row g-2">
                        <div className="col-md-6">
                          <input
                            type="file"
                            accept="image/*"
                            className="form-control"
                            onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                          />
                        </div>
                        <div className="col-md-3 d-grid">
                          <button type="button" className="btn btn-outline-secondary" onClick={handleUploadImage} disabled={uploading}>
                            {uploading ? 'Đang tải...' : 'Tải ảnh lên'}
                          </button>
                        </div>
                        <div className="col-12">
                          <small className="text-muted">Hoặc dán URL ảnh trực tiếp:</small>
                          <input
                            type="text"
                            className="form-control mt-1"
                            value={formData.imageUrl}
                            onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                            placeholder="https://example.com/image.jpg hoặc sẽ tự điền sau khi tải ảnh"
                          />
                        </div>
                      </div>
                      {formData.imageUrl && (
                        <div className="mt-2">
                          <img src={formData.imageUrl} alt="preview" style={{ maxHeight: 120, borderRadius: 8 }} onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/img/default-food.jpg'; }} />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
                    Hủy
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {editingItem ? 'Cập nhật' : 'Thêm mới'}
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

export default FoodMenuManagement;
