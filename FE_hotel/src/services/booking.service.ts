import api from '../utils/api';
import type { Booking, BookingDetail, BookingCreateRequest } from '../types/booking.types';

export const bookingService = {
  // Tạo booking mới (cần JWT token)
  createBooking: async (data: BookingCreateRequest): Promise<Booking> => {
    const response = await api.post('/bookings', data);
    return response.data;
  },

  // Lấy danh sách booking của user hiện tại với thông tin chi tiết
  getMyBookings: async (): Promise<BookingDetail[]> => {
    const response = await api.get('/bookings/my-bookings');
    return response.data;
  },

  // Lấy chi tiết 1 booking
  getBookingById: async (id: number): Promise<Booking> => {
    const response = await api.get(`/bookings/${id}`);
    return response.data;
  },

  // Hủy booking
  cancelBooking: async (id: number): Promise<Booking> => {
    const response = await api.delete(`/bookings/${id}`);
    return response.data;
  }
};
