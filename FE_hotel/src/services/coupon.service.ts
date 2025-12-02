import api from '../utils/api';

export const couponService = {
  validateCoupon: async (code: string, amount: number) => {
    const response = await api.get(`/coupons/validate/${code}`, {
      params: { amount }
    });
    return response.data;
  }
};
