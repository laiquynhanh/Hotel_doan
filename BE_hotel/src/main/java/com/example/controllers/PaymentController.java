// ========================================
// CONTROLLER THANH TOÁN (Payment Controller)
// ========================================
// Xử lý các endpoint liên quan đến:
// - Tạo yêu cầu thanh toán (/payment/create)
// - Xử lý callback từ VNPay (/payment/vnpay-return)
// - Kiểm tra trạng thái thanh toán
// - Tự động xác nhận booking sau khi thanh toán thành công
// - Gửi email xác nhận sau thanh toán

package com.example.controllers;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.domain.Booking;
import com.example.domain.Payment;
import com.example.domain.PaymentStatus;
import com.example.repositories.BookingRepository;
import com.example.repositories.PaymentRepository;
import com.example.services.VNPayService;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/payment")
@RequiredArgsConstructor
public class PaymentController {

    private static final Logger logger = LoggerFactory.getLogger(PaymentController.class);

    private final VNPayService vnPayService;
    private final BookingRepository bookingRepository;
    private final PaymentRepository paymentRepository;
    private final com.example.services.EmailService emailService;

    @PostMapping("/create")
    /**
     * Tạo Payment và trả về URL để chuyển hướng tới VNPay.
     * Quy trình:
     * - Nhận bookingId và amount (BigDecimal, đơn vị VND) từ request.
     * - Lưu một bản ghi Payment với trạng thái PENDING (chưa thanh toán).
     * - Gọi VNPayService.createPaymentUrl(...) để dựng URL thanh toán đã ký. Lưu ý: khi tạo tham số
     *   cho VNPay, trường vnp_Amount = amount * 100 (VNPay sử dụng đơn vị nhỏ nhất).
     * - Trả về JSON { paymentUrl, paymentId } cho frontend, frontend sẽ redirect đến paymentUrl.
     */
    public ResponseEntity<?> createPayment(@RequestParam Long bookingId, @RequestParam BigDecimal amount, HttpServletRequest request) {
        try {
            Booking booking = bookingRepository.findById(bookingId).orElseThrow(() -> new RuntimeException("Booking not found"));

            logger.debug("createPayment called for bookingId={} amount={}", bookingId, amount);

            Payment payment = new Payment();
            payment.setBooking(booking);
            payment.setAmount(amount);
            payment.setPaymentMethod("VNPAY");
            payment.setStatus(PaymentStatus.PENDING);
            payment.setDescription("Dat coc phong " + booking.getRoom().getRoomNumber());
            payment = paymentRepository.save(payment);

            String ipAddress = request.getHeader("X-FORWARDED-FOR");
            if (ipAddress == null || ipAddress.isEmpty()) ipAddress = request.getRemoteAddr();

            // Sử dụng payment.id làm txnRef để đối chiếu khi VNPay callback trả về
            String txnRef = String.valueOf(payment.getId());
            String orderInfo = "Dat coc booking #" + booking.getId();
            // Tạo URL đã ký bằng VNPayService (trong đó vnp_Amount = amount * 100)
            String paymentUrl = vnPayService.createPaymentUrl(txnRef, payment.getAmount().longValue(), orderInfo, ipAddress);

            Map<String, String> resp = new HashMap<>();
            resp.put("paymentUrl", paymentUrl);
            resp.put("paymentId", payment.getId().toString());

            logger.info("Created VNPay paymentUrl for paymentId={}: {}", payment.getId(), paymentUrl);

            return ResponseEntity.ok(resp);
        } catch (Exception e) {
            logger.error("Error in createPayment: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/vnpay-return")
    public ResponseEntity<?> vnpayReturn(@RequestParam Map<String, String> params) {
        try {
            // VNPay redirect sẽ gửi lại các tham số trong querystring. Trước hết verify chữ ký.
            boolean valid = vnPayService.verifyPaymentResponse(params);
            String txnRef = params.get("vnp_TxnRef");
            String responseCode = params.get("vnp_ResponseCode");
            String amountStr = params.get("vnp_Amount");

            Map<String, Object> resp = new HashMap<>();
            resp.put("isValid", valid);
            resp.put("responseCode", responseCode);

            if (!valid) {
                resp.put("status", "FAILED");
                resp.put("message", "Invalid signature");
                return ResponseEntity.ok(resp);
            }

            Payment payment = paymentRepository.findById(Long.parseLong(txnRef)).orElse(null);
            if (payment == null) {
                resp.put("status", "FAILED");
                resp.put("message", "Payment not found");
                return ResponseEntity.ok(resp);
            }

            long vnpAmount = 0L;
            if (amountStr != null) {
                try { vnpAmount = Long.parseLong(amountStr); } catch (Exception ignored) {}
            }

            // VNPay trả vnp_Amount ở đơn vị nhỏ nhất nên so sánh với payment.amount * 100
            long expected = payment.getAmount().longValue() * 100L;
            if (vnpAmount != expected) {
                resp.put("status", "FAILED");
                resp.put("message", "Amount mismatch");
                return ResponseEntity.ok(resp);
            }

            Booking booking = payment.getBooking();
            
            if ("00".equals(responseCode)) {
                // Idempotency: if payment already marked SUCCESS, skip re-processing (avoid duplicate emails/updates)
                if (payment.getStatus() == PaymentStatus.SUCCESS) {
                    resp.put("status", "SUCCESS");
                    resp.put("message", "Thanh toán đã được xử lý trước đó");
                } else {
                    payment.setStatus(PaymentStatus.SUCCESS);
                    payment.setTransactionId(params.get("vnp_TransactionNo") != null ? params.get("vnp_TransactionNo") : params.get("vnp_TxnRef"));
                    payment.setBankCode(params.get("vnp_BankCode"));
                    payment.setCardType(params.get("vnp_CardType"));
                    paymentRepository.save(payment);

                    // Auto-confirm booking after successful VNPay payment (no manual confirmation needed)
                    booking.setStatus(com.example.domain.BookingStatus.CONFIRMED);
                    bookingRepository.save(booking);

                    // Send confirmation email to user
                    if (booking.getUser() != null && booking.getUser().getEmail() != null) {
                        String to = booking.getUser().getEmail();
                        String subject = "Xác nhận thanh toán và đặt phòng #" + booking.getId();
                        String body = String.format("Xin chào %s,\n\nThanh toán đặt cọc thành công cho booking #%d. Phòng: %s (số: %s).\nSố tiền: %s VND.\n\nCảm ơn!",
                            booking.getUser().getFullName() != null ? booking.getUser().getFullName() : booking.getUser().getUsername(),
                            booking.getId(), booking.getRoom().getRoomType(), booking.getRoom().getRoomNumber(), payment.getAmount().toPlainString());
                        emailService.sendSimpleEmail(to, subject, body);
                    }

                    resp.put("status", "SUCCESS");
                    resp.put("message", "Thanh toán thành công!");
                }
                resp.put("bookingId", booking.getId());
            } else {
                payment.setStatus(PaymentStatus.FAILED);
                paymentRepository.save(payment);
                resp.put("status", "FAILED");
                resp.put("message", "Thanh toán thất bại");
            }

            return ResponseEntity.ok(resp);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/booking/{bookingId}")
    public ResponseEntity<?> getPaymentsByBooking(@PathVariable Long bookingId) {
        try {
            var payments = paymentRepository.findByBookingId(bookingId);
            return ResponseEntity.ok(payments);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
