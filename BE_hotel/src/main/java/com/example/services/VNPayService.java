// ========================================
// DỊCH VỤ THANH TOÁN VNPAY (VNPay Service)
// ========================================
// Xử lý logic liên quan đến:
// - Tạo URL thanh toán VNPay với các tham số giao dịch
// - Xác thực phản hồi từ VNPay (kiểm tra chữ ký, trạng thái)
// - Tính toán HMAC-SHA512 để bảo mật giao dịch
// - Quản lý thông số thanh toán (mã giao dịch, số tiền, thời gian)

package com.example.services;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Collections;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.TimeZone;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import com.example.config.VNPayConfig;

@Service
public class VNPayService {
    private final VNPayConfig vnPayConfig;

    private static final Logger logger = LoggerFactory.getLogger(VNPayService.class);

    public VNPayService(VNPayConfig config) {
        this.vnPayConfig = config;
    }

    public String createPaymentUrl(String txnRef, Long amountVnd, String orderInfo, String ipAddress) {
        try {
            // Ghi chú: amountVnd ở đây là số nguyên VND (ví dụ 100000 = 100.000 VND).
            // Khi gửi tới VNPay, tham số vnp_Amount phải ở đơn vị nhỏ nhất (VND * 100),
            // do đó chúng ta nhân amountVnd với 100 trước khi đặt vào tham số.
            Map<String, String> vnpParams = new HashMap<>();
            vnpParams.put("vnp_Version", vnPayConfig.getVersion());
            vnpParams.put("vnp_Command", vnPayConfig.getCommand());
            vnpParams.put("vnp_TmnCode", vnPayConfig.getTmnCode());
            // vnp_Amount = amount (VND) * 100 (đơn vị nhỏ nhất của VNPay)
            vnpParams.put("vnp_Amount", String.valueOf(amountVnd * 100));
            vnpParams.put("vnp_CurrCode", "VND");
            vnpParams.put("vnp_TxnRef", txnRef);
            vnpParams.put("vnp_OrderInfo", orderInfo);
            vnpParams.put("vnp_OrderType", vnPayConfig.getOrderType());
            vnpParams.put("vnp_Locale", "vn");
            vnpParams.put("vnp_ReturnUrl", vnPayConfig.getReturnUrl());
            vnpParams.put("vnp_IpAddr", ipAddress);

            Calendar calendar = Calendar.getInstance(TimeZone.getTimeZone("Etc/GMT+7"));
            SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
            String vnpCreateDate = formatter.format(calendar.getTime());
            vnpParams.put("vnp_CreateDate", vnpCreateDate);

            calendar.add(Calendar.MINUTE, 15);
            String vnpExpireDate = formatter.format(calendar.getTime());
            vnpParams.put("vnp_ExpireDate", vnpExpireDate);

            // Sort
            List<String> fieldNames = new ArrayList<>(vnpParams.keySet());
            Collections.sort(fieldNames);

            StringBuilder hashData = new StringBuilder();
            StringBuilder query = new StringBuilder();
            Iterator<String> itr = fieldNames.iterator();
            while (itr.hasNext()) {
                String fieldName = itr.next();
                String fieldValue = vnpParams.get(fieldName);
                if (fieldValue != null && fieldValue.length() > 0) {
                    hashData.append(fieldName).append('=').append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII.toString()));
                    query.append(URLEncoder.encode(fieldName, StandardCharsets.US_ASCII.toString())).append('=').append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII.toString()));
                    if (itr.hasNext()) {
                        hashData.append('&');
                        query.append('&');
                    }
                }
            }

            // Tính chữ ký HMAC-SHA512 từ chuỗi đã sắp xếp (hashData) bằng secret (vnPayConfig.getHashSecret()).
            String vnpSecureHash = hmacSHA512(vnPayConfig.getHashSecret(), hashData.toString());
            String paymentUrl = vnPayConfig.getVnpayUrl() + "?" + query.toString() + "&vnp_SecureHash=" + vnpSecureHash;
            // Ghi log URL (lưu ý: không in secret ở production)
            logger.debug("VNPay createPaymentUrl generated URL for txnRef={}: {}", txnRef, paymentUrl);
            return paymentUrl;
        } catch (Exception e) {
            throw new RuntimeException("Error creating VNPay url: " + e.getMessage(), e);
        }
    }

    public boolean verifyPaymentResponse(Map<String, String> params) {
        try {
            // Xác thực chữ ký trả về từ VNPay:
            // - Lấy vnp_SecureHash từ params rồi loại bỏ trường này trước khi tính lại chuỗi dữ liệu.
            // - Sắp xếp các trường theo tên, xây dựng chuỗi đã encode giống như khi tạo chữ ký ban đầu.
            // - Tính HMAC-SHA512 với secret và so sánh với vnp_SecureHash.
            String vnpSecureHash = params.get("vnp_SecureHash");
            params.remove("vnp_SecureHash");
            params.remove("vnp_SecureHashType");

            List<String> fieldNames = new ArrayList<>(params.keySet());
            Collections.sort(fieldNames);
            StringBuilder hashData = new StringBuilder();
            Iterator<String> itr = fieldNames.iterator();
            while (itr.hasNext()) {
                String fieldName = itr.next();
                String fieldValue = params.get(fieldName);
                if (fieldValue != null && fieldValue.length() > 0) {
                    hashData.append(fieldName).append('=').append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII.toString()));
                    if (itr.hasNext()) hashData.append('&');
                }
            }
            String signValue = hmacSHA512(vnPayConfig.getHashSecret(), hashData.toString());
            return signValue.equals(vnpSecureHash);
        } catch (Exception e) {
            return false;
        }
    }

    private String hmacSHA512(String key, String data) {
        try {
            Mac hmac512 = Mac.getInstance("HmacSHA512");
            SecretKeySpec secretKey = new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA512");
            hmac512.init(secretKey);
            byte[] hashBytes = hmac512.doFinal(data.getBytes(StandardCharsets.UTF_8));
            StringBuilder hash = new StringBuilder();
            for (byte b : hashBytes) {
                hash.append(String.format("%02x", b));
            }
            return hash.toString();
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}
