package com.example.controllers;

import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import com.example.dto.LoginDTO;
import com.example.dto.LoginResponseDTO;
import com.example.dto.RegisterDTO;
import com.example.dto.UserResponseDTO;
import com.example.services.UserService;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    @Autowired
    private UserService userService;
    
    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterDTO registerDTO) {
        try {
            UserResponseDTO user = userService.register(registerDTO);
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/login") 
    public ResponseEntity<?> login(@RequestBody LoginDTO loginDTO) {
        try {
            LoginResponseDTO response = userService.login(loginDTO);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    // Temporary endpoint to generate BCrypt hash
    @GetMapping("/hash/{password}")
    public ResponseEntity<String> generateHash(@PathVariable String password) {
        String hash = passwordEncoder.encode(password);
        return ResponseEntity.ok(hash);
    }
}
