// ========================================
// DỊCH VỤ NGƯỜI DÙNG (User Service)
// ========================================
// Xử lý logic liên quan đến:
// - Đăng ký tài khoản (validate, mã hóa password)
// - Đăng nhập (kiểm tra password, sinh JWT)
// - Cập nhật hồ sơ (email, họ tên, SĐT)
// - Đổi mật khẩu (kiểm tra password cũ)
// - Tìm user theo ID/username/email
// - Gửi email chào mừng khi đăng ký

package com.example.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.example.domain.Role;
import com.example.domain.User;
import com.example.dto.ChangePasswordDTO;
import com.example.dto.LoginDTO;
import com.example.dto.LoginResponseDTO;
import com.example.dto.RegisterDTO;
import com.example.dto.UpdateProfileDTO;
import com.example.dto.UserResponseDTO;
import com.example.repositories.UserRepository;

@Service
public class UserService {

    private static final String USER_NOT_FOUND = "User not found";

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private EmailService emailService;

    public UserResponseDTO register(RegisterDTO registerDTO) {
        if(userRepository.existsByUsername(registerDTO.getUsername())) {
            throw new IllegalArgumentException("Username already exists");
        }

        User user = new User();
        user.setUsername(registerDTO.getUsername());
        user.setPassword(passwordEncoder.encode(registerDTO.getPassword())); // Mã hóa password
        user.setEmail(registerDTO.getEmail());
        user.setFullName(registerDTO.getFullName());
        user.setPhoneNumber(registerDTO.getPhoneNumber());
        user.setRole(Role.USER); // Default role
        
        User savedUser = userRepository.save(user);
        // Send welcome email asynchronously
        if (savedUser.getEmail() != null && !savedUser.getEmail().isEmpty()) {
            String subject = "Chào mừng đến với Hotel";
            String body = String.format("Xin chào %s,\n\nCảm ơn bạn đã đăng ký tài khoản tại Hotel. Chúc bạn có những trải nghiệm tuyệt vời!\n\nMã người dùng: %d", savedUser.getFullName() != null ? savedUser.getFullName() : savedUser.getUsername(), savedUser.getId());
            emailService.sendSimpleEmail(savedUser.getEmail(), subject, body);
        }
        
        return new UserResponseDTO(
            savedUser.getId(),
            savedUser.getUsername(),
            savedUser.getEmail(),
            savedUser.getFullName(),
            savedUser.getPhoneNumber(),
            savedUser.getRole()
        );
    }

    public LoginResponseDTO login(LoginDTO loginDTO) {
        User user = userRepository.findByUsername(loginDTO.getUsername());
        if(user == null || !passwordEncoder.matches(loginDTO.getPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Invalid username or password");
        }
        
        
        String token = jwtService.generateToken(user.getUsername(), user.getId(), user.getRole());
        
        return new LoginResponseDTO(
            token,
            user.getId(),
            user.getUsername(),
            user.getEmail(),
            user.getFullName(),
            user.getPhoneNumber(),
            user.getRole()
        );
    }

    public User findById(Long id) {
        return userRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException(USER_NOT_FOUND));
    }

    public User findByUsername(String username) {
        User user = userRepository.findByUsername(username);
        if (user == null) {
            throw new IllegalArgumentException(USER_NOT_FOUND);
        }
        return user;
    }

    public UserResponseDTO updateProfile(Long userId, UpdateProfileDTO updateProfileDTO) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new IllegalArgumentException(USER_NOT_FOUND));
        
        // Check if email is already used by another user
        User existingUser = userRepository.findByEmail(updateProfileDTO.getEmail());
        if (existingUser != null && !existingUser.getId().equals(userId)) {
            throw new IllegalArgumentException("Email đã được sử dụng bởi tài khoản khác");
        }
        
        user.setFullName(updateProfileDTO.getFullName());
        user.setEmail(updateProfileDTO.getEmail());
        user.setPhoneNumber(updateProfileDTO.getPhoneNumber());
        
        User updatedUser = userRepository.save(user);
        
        return new UserResponseDTO(
            updatedUser.getId(),
            updatedUser.getUsername(),
            updatedUser.getEmail(),
            updatedUser.getFullName(),
            updatedUser.getPhoneNumber(),
            updatedUser.getRole()
        );
    }

    public void changePassword(Long userId, ChangePasswordDTO dto) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new IllegalArgumentException(USER_NOT_FOUND));

        if (!passwordEncoder.matches(dto.getCurrentPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Mật khẩu hiện tại không đúng");
        }

        user.setPassword(passwordEncoder.encode(dto.getNewPassword()));
        userRepository.save(user);
    }
}
