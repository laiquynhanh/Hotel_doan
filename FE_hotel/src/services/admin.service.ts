import api from '../utils/api';
import type { BookingStatus } from '../types/booking.types';

// Booking DTO returned from admin endpoints
export interface AdminBookingDTO {
  id: number;
  userId: number;
  userName: string; // full name of user
  roomId: number;
  roomNumber: string;
  roomType: string; // display name already mapped on backend
  checkInDate: string;
  checkOutDate: string;
  numberOfGuests: number;
  totalPrice: number;
  status: BookingStatus;
  specialRequests?: string;
  createdAt: string;
}

export interface DashboardStats {
  totalUsers: number;
  totalRooms: number;
  totalBookings: number;
  pendingBookings: number;
  confirmedBookings: number;
  checkedInBookings: number;
  availableRooms: number;
  occupiedRooms: number;
  totalRevenue: number;
  monthlyRevenue: number;
}

export interface UserDTO {
  id: number;
  username: string;
  email: string;
  fullName: string;
  phoneNumber?: string;
  role: string;
}

export const adminService = {
  // Dashboard Stats
  getDashboardStats: async (): Promise<DashboardStats> => {
    const response = await api.get('/admin/dashboard/stats');
    return response.data;
  },

  // User Management
  getAllUsers: async (): Promise<UserDTO[]> => {
    const response = await api.get('/admin/users');
    return response.data;
  },

  updateUser: async (id: number, data: { fullName?: string; email?: string; phoneNumber?: string }): Promise<void> => {
    await api.put(`/admin/users/${id}`, data);
  },

  deleteUser: async (id: number): Promise<void> => {
    await api.delete(`/admin/users/${id}`);
  },

  updateUserRole: async (id: number, role: string): Promise<void> => {
    await api.put(`/admin/users/${id}/role`, null, { params: { role } });
  },

  // Room Management
  getAllRooms: async () => {
    const response = await api.get('/admin/rooms');
    return response.data;
  },

  // Booking Management
  getAllBookings: async (): Promise<AdminBookingDTO[]> => {
    const response = await api.get('/admin/bookings');
    return response.data as AdminBookingDTO[];
  },

  updateBookingStatus: async (id: number, status: string) => {
    await api.put(`/admin/bookings/${id}/status`, null, { params: { status } });
  },

  deleteBooking: async (id: number): Promise<void> => {
    await api.delete(`/admin/bookings/${id}`);
  },

  // Food Management
  getAllFoodItems: async () => {
    const response = await api.get('/admin/food/items');
    return response.data;
  },

  createFoodItem: async (foodItem: any) => {
    const response = await api.post('/admin/food/items', foodItem);
    return response.data;
  },

  updateFoodItem: async (id: number, foodItem: any) => {
    const response = await api.put(`/admin/food/items/${id}`, foodItem);
    return response.data;
  },

  deleteFoodItem: async (id: number): Promise<void> => {
    await api.delete(`/admin/food/items/${id}`);
  },

  toggleFoodAvailability: async (id: number): Promise<void> => {
    await api.put(`/admin/food/items/${id}/toggle-availability`);
  },

  // Food Orders Management
  getAllFoodOrders: async (status?: string) => {
    const params = status ? { status } : {};
    const response = await api.get('/admin/food/orders', { params });
    return response.data;
  },

  updateFoodOrderStatus: async (id: number, status: string) => {
    await api.put(`/admin/food/orders/${id}/status`, null, { params: { status } });
  },

  // Restaurant Tables Management
  getAllRestaurantTables: async () => {
    const response = await api.get('/admin/restaurant/tables');
    return response.data;
  },

  createRestaurantTable: async (table: any) => {
    const response = await api.post('/admin/restaurant/tables', table);
    return response.data;
  },

  updateRestaurantTable: async (id: number, table: any) => {
    const response = await api.put(`/admin/restaurant/tables/${id}`, table);
    return response.data;
  },

  deleteRestaurantTable: async (id: number): Promise<void> => {
    await api.delete(`/admin/restaurant/tables/${id}`);
  },

  // Table Reservations Management
  getAllReservations: async (status?: string, date?: string) => {
    const params: any = {};
    if (status) params.status = status;
    if (date) params.date = date;
    const response = await api.get('/admin/restaurant/reservations', { params });
    return response.data;
  },

  updateReservationStatus: async (id: number, status: string) => {
    await api.put(`/admin/restaurant/reservations/${id}/status`, null, { params: { status } });
  },

  cancelReservation: async (id: number): Promise<void> => {
    await api.delete(`/admin/restaurant/reservations/${id}`);
  }
};
