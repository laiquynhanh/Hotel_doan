// ========================================
// DỊCH VỤ GỬI EMAIL (Email Service)
// ========================================
// Xử lý gửi email cho các chức năng:
// - Chào mừng khi đăng ký
// - Xác nhận thanh toán/đặt phòng
// - Gửi link đặt lại mật khẩu
// - Dùng JavaMailSender (SMTP) - async task
// - Có template email (nếu cần)

package com.example.services;

import java.io.InputStream;
import java.nio.charset.StandardCharsets;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ClassPathResource;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    @Autowired
    private JavaMailSender mailSender;

    @Async
    public void sendSimpleEmail(String to, String subject, String body) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);
            if (mailSender != null) {
                mailSender.send(message);
                log.info("Queued simple email to={}", to);
            } else {
                log.warn("JavaMailSender is not configured; skipping send to={}", to);
            }
        } catch (MailException e) {
            log.error("Failed to send email (mail exception) to {}: {}", to, e.getMessage(), e);
        } catch (Exception e) {
            log.error("Failed to send email to {}: {}", to, e.getMessage(), e);
        }
    }

    public String loadTemplate(String path) {
        try (InputStream is = new ClassPathResource(path).getInputStream()) {
            byte[] bytes = is.readAllBytes();
            return new String(bytes, StandardCharsets.UTF_8);
        } catch (Exception e) {
            log.warn("Failed to load email template {}: {}", path, e.getMessage());
            return null;
        }
    }
}
