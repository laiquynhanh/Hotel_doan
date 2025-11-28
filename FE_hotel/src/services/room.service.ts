import api from '../utils/api';
import type { Room, RoomSearchParams } from '../types/room.types';

export const roomService = {
  // Lấy tất cả phòng
  getAllRooms: async (): Promise<Room[]> => {
    const response = await api.get('/rooms');
    return response.data;
  },

  // Lấy chi tiết 1 phòng
  getRoomById: async (id: number): Promise<Room> => {
    const response = await api.get(`/rooms/${id}`);
    return response.data;
  },

  // Tìm phòng trống theo ngày và bộ lọc
  searchAvailableRooms: async (params: RoomSearchParams): Promise<Room[]> => {
    const response = await api.post('/rooms/search', params);
    return response.data;
  },

  // Tìm phòng theo tiêu chí (wrapper cho searchAvailableRooms)
  searchRooms: async (params: { checkInDate: string; checkOutDate: string; capacity?: number }): Promise<Room[]> => {
    const response = await api.post('/rooms/search', params);
    return response.data;
  },

  // Tạo phòng mới (admin)
  createRoom: async (roomData: Partial<Room>): Promise<Room> => {
    const response = await api.post('/rooms', roomData);
    return response.data;
  },

  // Cập nhật phòng (admin)
  updateRoom: async (id: number, roomData: Partial<Room>): Promise<Room> => {
    const response = await api.put(`/rooms/${id}`, roomData);
    return response.data;
  },

  // Xóa phòng (admin)
  deleteRoom: async (id: number): Promise<void> => {
    await api.delete(`/rooms/${id}`);
  }
};
