import api from '../utils/api';

export type Review = {
  id: number;
  userId: number;
  userName?: string;
  roomId: number;
  roomNumber?: string;
  roomType?: string;
  bookingId?: number | null;
  rating: number;
  comment?: string;
  adminResponse?: string;
  respondedAt?: string | null;
  approved: boolean;
  createdAt: string;
};

export const reviewService = {
  getRoomReviews: async (roomId: number): Promise<Review[]> => {
    const res = await api.get(`/reviews/room/${roomId}`);
    return res.data as Review[];
  },
  getAverageForRoom: async (roomId: number): Promise<{ average: number; count: number }> => {
    const res = await api.get(`/reviews/room/${roomId}/average`);
    return res.data as { average: number; count: number };
  },
  getMyReviews: async (): Promise<Review[]> => {
    const res = await api.get('/reviews/my-reviews');
    return res.data as Review[];
  },
  createReview: async (payload: { roomId: number; bookingId?: number | null; rating: number; comment?: string }) => {
    const res = await api.post('/reviews', payload);
    return res.data as Review;
  }
};
