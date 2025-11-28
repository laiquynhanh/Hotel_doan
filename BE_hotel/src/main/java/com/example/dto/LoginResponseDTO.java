package com.example.dto;

import com.example.domain.Role;

public class LoginResponseDTO {
    private String token;
    private Long userId;
    private String username;
    private String email;
    private String fullName;
    private Role role;

    public LoginResponseDTO() {
    }
    private String phoneNumber;

    public LoginResponseDTO(String token, Long userId, String username, String email, String fullName, String phoneNumber, Role role) {
        this.token = token;
        this.userId = userId;
        this.username = username;
        this.email = email;
        this.fullName = fullName;
        this.phoneNumber = phoneNumber;
        this.role = role;
    }

    // Backwards-compatible constructor
    public LoginResponseDTO(String token, Long userId, String username, String email, String fullName, Role role) {
        this(token, userId, username, email, fullName, null, role);
    }

    // Getters and Setters
    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public Role getRole() {
        return role;
    }
    
    public String getPhoneNumber() {
        return phoneNumber;
    }
    
    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }
    public void setRole(Role role) {
        this.role = role;
    }
}
