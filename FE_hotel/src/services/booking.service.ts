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
  },

  // Cập nhật dịch vụ premium
  updatePremiumServices: async (
    id: number, 
    services: {
      airportPickup?: boolean;
      spaService?: boolean;
      laundryService?: boolean;
      tourGuide?: boolean;
    }
  ): Promise<Booking> => {
    const params = new URLSearchParams();
    if (services.airportPickup !== undefined) params.append('airportPickup', String(services.airportPickup));
    if (services.spaService !== undefined) params.append('spaService', String(services.spaService));
    if (services.laundryService !== undefined) params.append('laundryService', String(services.laundryService));
    if (services.tourGuide !== undefined) params.append('tourGuide', String(services.tourGuide));
    
    const response = await api.put(`/bookings/${id}/premium-services?${params.toString()}`);
    return response.data;
  }
};
