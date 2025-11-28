import api from '../utils/api';
import type { RestaurantTable, TableReservationCreate, TableReservation } from '../types/restaurant.types';

export const restaurantService = {
  // Lấy tất cả bàn
  getAllTables: async (minCapacity?: number): Promise<RestaurantTable[]> => {
    const params = minCapacity ? { minCapacity } : {};
    const response = await api.get('/restaurant/tables', { params });
    return response.data;
  },

  // Lấy chi tiết bàn
  getTableById: async (id: number): Promise<RestaurantTable> => {
    const response = await api.get(`/restaurant/tables/${id}`);
    return response.data;
  },

  // Tạo đặt bàn
  createReservation: async (reservationData: TableReservationCreate): Promise<TableReservation> => {
    const response = await api.post('/restaurant/reservations', reservationData);
    return response.data;
  },

  // Lấy đặt bàn của tôi
  getMyReservations: async (): Promise<TableReservation[]> => {
    const response = await api.get('/restaurant/reservations/my-reservations');
    return response.data;
  },

  // Lấy chi tiết đặt bàn
  getReservationById: async (id: number): Promise<TableReservation> => {
    const response = await api.get(`/restaurant/reservations/${id}`);
    return response.data;
  },

  // Hủy đặt bàn
  cancelReservation: async (id: number): Promise<void> => {
    await api.put(`/restaurant/reservations/${id}/cancel`);
  },

  // Lấy đặt bàn theo ngày
  getReservationsByDate: async (date: string): Promise<TableReservation[]> => {
    const response = await api.get('/restaurant/reservations/by-date', { params: { date } });
    return response.data;
  }
};
