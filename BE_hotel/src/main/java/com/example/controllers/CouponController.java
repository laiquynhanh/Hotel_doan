package com.example.controllers;

import com.example.dto.CouponDTO;
import com.example.services.CouponService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class CouponController {

    @Autowired
    private CouponService couponService;

    // Public endpoint to validate coupon
    @GetMapping("/coupons/validate/{code}")
    public ResponseEntity<?> validateCoupon(
            @PathVariable String code,
            @RequestParam BigDecimal amount) {
        try {
            CouponDTO coupon = couponService.validateAndGetCoupon(code, amount);
            BigDecimal discount = couponService.calculateDiscount(code, amount);
            
            Map<String, Object> response = new HashMap<>();
            response.put("valid", true);
            response.put("coupon", coupon);
            response.put("discount", discount);
            response.put("finalAmount", amount.subtract(discount));
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("valid", false);
            response.put("message", e.getMessage());
            return ResponseEntity.ok(response);
        }
    }

    // Admin endpoints
    @GetMapping("/admin/coupons")
    public ResponseEntity<?> getAllCoupons() {
        try {
            List<CouponDTO> coupons = couponService.getAllCoupons();
            return ResponseEntity.ok(coupons);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/admin/coupons/{id}")
    public ResponseEntity<?> getCouponById(@PathVariable Long id) {
        try {
            CouponDTO coupon = couponService.getCouponById(id);
            return ResponseEntity.ok(coupon);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/admin/coupons")
    public ResponseEntity<?> createCoupon(@RequestBody CouponDTO dto) {
        try {
            CouponDTO created = couponService.createCoupon(dto);
            return ResponseEntity.ok(created);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/admin/coupons/{id}")
    public ResponseEntity<?> updateCoupon(@PathVariable Long id, @RequestBody CouponDTO dto) {
        try {
            CouponDTO updated = couponService.updateCoupon(id, dto);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/admin/coupons/{id}")
    public ResponseEntity<?> deleteCoupon(@PathVariable Long id) {
        try {
            couponService.deleteCoupon(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
