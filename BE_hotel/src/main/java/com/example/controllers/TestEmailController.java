package com.example.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.services.EmailService;

@RestController
@RequestMapping("/api/test-email")
public class TestEmailController {

    @Autowired
    private EmailService emailService;

    @PostMapping("/send")
    public ResponseEntity<?> sendTest(@RequestBody TestEmailRequest req) {
        if (req.getTo() == null || req.getTo().isBlank()) {
            return ResponseEntity.badRequest().body("'to' is required");
        }
        String subject = req.getSubject() == null ? "Test email from BE_hotel" : req.getSubject();
        String body = req.getBody() == null ? "This is a test email." : req.getBody();
        emailService.sendSimpleEmail(req.getTo(), subject, body);
        return ResponseEntity.ok().body("Email queued (async)");
    }
}
