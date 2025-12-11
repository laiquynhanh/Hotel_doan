// ========================================
// DỊCH VỤ MÃ GIẢM GIÁ (Coupon Service)
// ========================================
// Xử lý logic liên quan đến:
// - Tạo mã giảm mới (validate mã, giá trị, hạn sử dụng)
// - Validate mã hợp lệ (check ngày, giá tối thiểu)
// - Lấy danh sách mã
// - Xóa mã hết hạn

package com.example.services;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.domain.Coupon;
import com.example.domain.DiscountType;
import com.example.dto.CouponDTO;
import com.example.repositories.CouponRepository;

@Service
public class CouponService {

    @Autowired
    private CouponRepository couponRepository;

    public List<CouponDTO> getAllCoupons() {
        return couponRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public CouponDTO getCouponById(Long id) {
        Coupon coupon = couponRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Coupon not found"));
        return convertToDTO(coupon);
    }

    public CouponDTO createCoupon(CouponDTO dto) {
        // Check if code already exists
        if (couponRepository.findByCode(dto.getCode()).isPresent()) {
            throw new IllegalArgumentException("Mã giảm giá đã tồn tại");
        }

        Coupon coupon = new Coupon();
        coupon.setCode(dto.getCode().toUpperCase());
        coupon.setDescription(dto.getDescription());
        coupon.setDiscountType(dto.getDiscountType());
        coupon.setDiscountValue(dto.getDiscountValue());
        coupon.setMinOrderAmount(dto.getMinOrderAmount());
        coupon.setMaxDiscountAmount(dto.getMaxDiscountAmount());
        coupon.setUsageLimit(dto.getUsageLimit());
        coupon.setValidFrom(dto.getValidFrom());
        coupon.setValidUntil(dto.getValidUntil());
        coupon.setActive(dto.getActive() != null ? dto.getActive() : true);

        Coupon saved = couponRepository.save(coupon);
        return convertToDTO(saved);
    }

    public CouponDTO updateCoupon(Long id, CouponDTO dto) {
        Coupon coupon = couponRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Coupon not found"));

        coupon.setDescription(dto.getDescription());
        coupon.setDiscountType(dto.getDiscountType());
        coupon.setDiscountValue(dto.getDiscountValue());
        coupon.setMinOrderAmount(dto.getMinOrderAmount());
        coupon.setMaxDiscountAmount(dto.getMaxDiscountAmount());
        coupon.setUsageLimit(dto.getUsageLimit());
        coupon.setValidFrom(dto.getValidFrom());
        coupon.setValidUntil(dto.getValidUntil());
        coupon.setActive(dto.getActive());

        Coupon updated = couponRepository.save(coupon);
        return convertToDTO(updated);
    }

    public void deleteCoupon(Long id) {
        couponRepository.deleteById(id);
    }

    public CouponDTO validateAndGetCoupon(String code, BigDecimal orderAmount) {
        Coupon coupon = couponRepository.findByCodeAndActiveTrue(code.toUpperCase())
                .orElseThrow(() -> new RuntimeException("Mã giảm giá không tồn tại hoặc đã hết hạn"));

        if (!coupon.isValid()) {
            throw new IllegalArgumentException("Mã giảm giá không còn hiệu lực");
        }

        if (coupon.getMinOrderAmount() != null && orderAmount.compareTo(coupon.getMinOrderAmount()) < 0) {
            throw new IllegalArgumentException("Đơn hàng chưa đủ giá trị tối thiểu để áp dụng mã giảm giá");
        }

        return convertToDTO(coupon);
    }

    public BigDecimal calculateDiscount(String code, BigDecimal orderAmount) {
        CouponDTO coupon = validateAndGetCoupon(code, orderAmount);
        
        BigDecimal discount;
        if (coupon.getDiscountType() == DiscountType.PERCENTAGE) {
            discount = orderAmount.multiply(coupon.getDiscountValue()).divide(BigDecimal.valueOf(100));
            if (coupon.getMaxDiscountAmount() != null && discount.compareTo(coupon.getMaxDiscountAmount()) > 0) {
                discount = coupon.getMaxDiscountAmount();
            }
        } else {
            discount = coupon.getDiscountValue();
        }

        return discount;
    }

    public void applyCoupon(String code) {
        Coupon coupon = couponRepository.findByCode(code.toUpperCase())
                .orElseThrow(() -> new RuntimeException("Coupon not found"));
        
        coupon.incrementUsedCount();
        couponRepository.save(coupon);
    }

    private CouponDTO convertToDTO(Coupon coupon) {
        CouponDTO dto = new CouponDTO();
        dto.setId(coupon.getId());
        dto.setCode(coupon.getCode());
        dto.setDescription(coupon.getDescription());
        dto.setDiscountType(coupon.getDiscountType());
        dto.setDiscountValue(coupon.getDiscountValue());
        dto.setMinOrderAmount(coupon.getMinOrderAmount());
        dto.setMaxDiscountAmount(coupon.getMaxDiscountAmount());
        dto.setUsageLimit(coupon.getUsageLimit());
        dto.setUsedCount(coupon.getUsedCount());
        dto.setValidFrom(coupon.getValidFrom());
        dto.setValidUntil(coupon.getValidUntil());
        dto.setActive(coupon.getActive());
        dto.setCreatedAt(coupon.getCreatedAt());
        return dto;
    }
}
