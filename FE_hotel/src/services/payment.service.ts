import api from '../utils/api';

export interface PaymentDTO {
  id: number;
  bookingId: number;
  amount: number;
  paymentMethod: string;
  status: 'PENDING'|'SUCCESS'|'FAILED'|'REFUNDED';
  transactionId?: string;
  bankCode?: string;
  cardType?: string;
  description?: string;
  createdAt: string;
  paidAt?: string;
}

export const paymentService = {
  createPayment: async (bookingId: number, amount: number) => {
    // - API này gửi số tiền đặt cọc lên backend để backend tạo bản ghi Payment
    //   và xây dựng URL thanh toán VNPay
    // - Backend sẽ lưu Payment với trạng thái PENDING và trả về { paymentUrl, paymentId }.
    // - api.baseURL đã chứa '/api', vì vậy endpoint ở đây là '/payment/create'.
    const response = await api.post('/payment/create', null, {
      params: { bookingId, amount }
    });
    // in ra response giúp dễ debug khi redirect không xảy ra.
    // Bỏ hoặc giảm logging này khi chạy production.
    console.debug('[paymentService] createPayment response:', response);
    return response.data as { paymentUrl: string; paymentId: string };
  },

  getPaymentsByBooking: async (bookingId: number) => {
    const response = await api.get(`/payment/booking/${bookingId}`);
    return response.data as PaymentDTO[];
  },

  // Gọi endpoint kiểm tra kết quả trả về từ VNPay (return URL).
  // Thường dùng khi VNPay redirect browser về trang frontend và frontend muốn verify với backend.
  verifyVNPayReturn: async (params: Record<string, string>) => {
    const response = await api.get('/payment/vnpay-return', { params });
    return response.data;
  }
};
