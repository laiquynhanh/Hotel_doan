// ========================================
// DỊCH VỤ ĐẶT LẠI MẬT KHẨU (Password Reset Service)
// ========================================
// Xử lý logic liên quan đến:
// - Sinh token reset mật khẩu (UUID, hết hạn 30 phút)
// - Gửi email chứa link reset
// - Kiểm tra token hợp lệ & chưa dùng
// - Mã hóa & cập nhật mật khẩu mới
// - Dọn dẹp token cũ

package com.example.services;

import java.time.LocalDateTime;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.domain.PasswordResetToken;
import com.example.domain.User;
import com.example.repositories.PasswordResetTokenRepository;
import com.example.repositories.UserRepository;

@Service
public class PasswordResetService {

    private static final long TOKEN_EXPIRY_MINUTES = 30;

    @Value("${app.frontend.reset-url:http://localhost:3000/reset-password}")
    private String resetUrl;

    @Autowired
    private PasswordResetTokenRepository passwordResetTokenRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmailService emailService;

    @Autowired
    private org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    @Transactional
    public void sendResetLink(String email) {
        User user = userRepository.findByEmail(email);
        if (user == null) {
            throw new IllegalArgumentException("Email không tồn tại trong hệ thống");
        }

        // Hủy token cũ và tạo token mới
        passwordResetTokenRepository.deleteByUser(user);

        PasswordResetToken token = new PasswordResetToken();
        token.setToken(UUID.randomUUID().toString());
        token.setUser(user);
        token.setExpiresAt(LocalDateTime.now().plusMinutes(TOKEN_EXPIRY_MINUTES));
        token.setUsed(false);
        passwordResetTokenRepository.save(token);

        String link = buildResetLink(token.getToken());
        String subject = "Đặt lại mật khẩu";
        String recipientName = user.getFullName() != null ? user.getFullName() : user.getUsername();
        String body = String.format(
            "Chào %s,%n%nNhấp vào liên kết sau để đặt lại mật khẩu (hết hạn sau %d phút):%n%s%n%nNếu bạn không yêu cầu, hãy bỏ qua email này.",
            recipientName,
            TOKEN_EXPIRY_MINUTES,
            link
        );

        emailService.sendSimpleEmail(user.getEmail(), subject, body);
    }

    @Transactional
    public void resetPassword(String tokenValue, String newPassword) {
        PasswordResetToken token = passwordResetTokenRepository.findByToken(tokenValue)
            .orElseThrow(() -> new IllegalArgumentException("Token không hợp lệ"));

        if (token.isUsed() || token.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Token đã hết hạn hoặc đã được sử dụng");
        }

        User user = token.getUser();
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        token.setUsed(true);
        passwordResetTokenRepository.save(token);

        // Dọn dẹp các token khác (nếu có) cho user này
        passwordResetTokenRepository.deleteByUser(user);
    }

    private String buildResetLink(String token) {
        String separator = resetUrl.contains("?") ? "&" : "?";
        return resetUrl + separator + "token=" + token;
    }
}