import { useState, useCallback } from 'react';

interface UseCRUDOptions<T> {
  fetchAll: () => Promise<T[]>;
  create: (data: Partial<T>) => Promise<T>;
  update: (id: number, data: Partial<T>) => Promise<T>;
  deleteItem: (id: number) => Promise<void>;
}

export function useAdminCRUD<T extends { id: number }>(options: UseCRUDOptions<T>) {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<T | null>(null);

  const loadItems = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await options.fetchAll();
      setItems(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Không thể tải dữ liệu');
      console.error('Error loading items:', err);
    } finally {
      setLoading(false);
    }
  }, [options]);

  const handleCreate = useCallback(async (data: Partial<T>) => {
    try {
      const newItem = await options.create(data);
      setItems(prev => [...prev, newItem]);
      setShowModal(false);
      return { success: true, data: newItem };
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Không thể tạo mới';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }
  }, [options]);

  const handleUpdate = useCallback(async (id: number, data: Partial<T>) => {
    try {
      const updated = await options.update(id, data);
      setItems(prev => prev.map(item => item.id === id ? updated : item));
      setShowModal(false);
      setEditingItem(null);
      return { success: true, data: updated };
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Không thể cập nhật';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }
  }, [options]);

  const handleDelete = useCallback(async (id: number) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa?')) {
      return { success: false };
    }

    try {
      await options.deleteItem(id);
      setItems(prev => prev.filter(item => item.id !== id));
      return { success: true };
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Không thể xóa';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }
  }, [options]);

  const openCreateModal = useCallback(() => {
    setEditingItem(null);
    setShowModal(true);
  }, []);

  const openEditModal = useCallback((item: T) => {
    setEditingItem(item);
    setShowModal(true);
  }, []);

  const closeModal = useCallback(() => {
    setShowModal(false);
    setEditingItem(null);
    setError(null);
  }, []);

  return {
    items,
    setItems,
    loading,
    error,
    setError,
    showModal,
    editingItem,
    loadItems,
    handleCreate,
    handleUpdate,
    handleDelete,
    openCreateModal,
    openEditModal,
    closeModal,
  };
}
