import api from '../utils/api';
import type { FoodItem, FoodOrderCreate, FoodOrder, FoodCategory } from '../types/food.types';

export const foodService = {
  // Lấy tất cả món ăn có sẵn
  getAllFoodItems: async (): Promise<FoodItem[]> => {
    const response = await api.get('/food');
    return response.data;
  },

  // Lấy chi tiết món ăn
  getFoodItemById: async (id: number): Promise<FoodItem> => {
    const response = await api.get(`/food/${id}`);
    return response.data;
  },

  // Lấy món ăn theo danh mục
  getFoodItemsByCategory: async (category: FoodCategory): Promise<FoodItem[]> => {
    const response = await api.get(`/food/category/${category}`);
    return response.data;
  },

  // Tìm kiếm món ăn
  searchFoodItems: async (keyword: string): Promise<FoodItem[]> => {
    const response = await api.get(`/food/search`, { params: { keyword } });
    return response.data;
  },

  // Tạo đơn room service
  createFoodOrder: async (orderData: FoodOrderCreate): Promise<FoodOrder> => {
    // Send only fields required by backend DTO; price is derived server-side
    const payload = {
      roomNumber: orderData.roomNumber || undefined,
      specialInstructions: orderData.specialInstructions || undefined,
      items: orderData.items.map(i => ({
        foodItemId: i.foodItemId,
        quantity: i.quantity
      }))
    };
    const response = await api.post('/food-orders', payload);
    return response.data;
  },

  // Lấy đơn hàng của tôi
  getMyOrders: async (): Promise<FoodOrder[]> => {
    const response = await api.get('/food-orders/my-orders');
    return response.data;
  },

  // Lấy chi tiết đơn hàng
  getOrderById: async (id: number): Promise<FoodOrder> => {
    const response = await api.get(`/food-orders/${id}`);
    return response.data;
  },

  // Hủy đơn hàng
  cancelOrder: async (id: number): Promise<void> => {
    await api.put(`/food-orders/${id}/cancel`);
  }
};
