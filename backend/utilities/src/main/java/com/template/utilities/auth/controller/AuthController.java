package com.template.utilities.auth.controller;

import com.template.utilities.auth.dto.AuthRequest;
import com.template.utilities.auth.dto.AuthResponse;
import com.template.utilities.auth.dto.SignupRequest;
import com.template.utilities.auth.jwt.JwtUtil;
import com.template.utilities.user.entity.User;
import com.template.utilities.user.service.UserService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final UserService userService;

    public AuthController(UserService userService) {
        this.userService = userService;
    }

    // 🔐 LOGIN
    @PostMapping("/login")
    public AuthResponse login(@RequestBody AuthRequest request) {
        try {
            User user = userService.findByEmail(request.getEmail())
                    .orElse(null);

            if (user == null) {
                return new AuthResponse(false, "Invalid email or password", null);
            }

            if (!user.isEnabled()) {
                return new AuthResponse(false, "User is disabled", null);
            }

            // ⚠️ Plain password check for template
            if (!user.getPassword().equals(request.getPassword())) {
                return new AuthResponse(false, "Invalid email or password", null);
            }

            String token = JwtUtil.generateToken(
                    user.getEmail(),
                    user.getRole().name()
            );

            return new AuthResponse(true, "Login successful", token);
        } catch (Exception e) {
            return new AuthResponse(false, "Login failed: " + e.getMessage(), null);
        }
    }

    // 📝 SIGNUP
    @PostMapping("/signup")
    public AuthResponse signup(@RequestBody SignupRequest request) {
        try {
            User user = userService.register(
                    request.getEmail(),
                    request.getUserName(),
                    request.getPassword()
            );

            String token = JwtUtil.generateToken(
                    user.getEmail(),
                    user.getRole().name()
            );

            return new AuthResponse(true, "Signup successful", token);
        } catch (Exception e) {
            return new AuthResponse(false, e.getMessage(), null);
        }
    }
}
