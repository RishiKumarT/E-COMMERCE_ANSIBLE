package com.rishi.ecom.controller;

import com.rishi.ecom.dto.ForgotPasswordRequest;
import com.rishi.ecom.dto.LoginRequest;
import com.rishi.ecom.dto.ResetPasswordRequest;
import com.rishi.ecom.entity.User;
import com.rishi.ecom.security.JwtUtil;
import com.rishi.ecom.service.PasswordResetService;
import com.rishi.ecom.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.bind.annotation.*;

import lombok.RequiredArgsConstructor;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
//@CrossOrigin(origins = "*")
@RequiredArgsConstructor // Use Lombok to inject final fields
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserService userService;
    private final PasswordResetService passwordResetService;
    private final JwtUtil jwtUtil;

    @PostMapping("/login")
    public Map<String, Object> login(@RequestBody LoginRequest loginRequest) {
        // Authenticate using Spring Security
        var authenticationToken = 
            new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword());

        authenticationManager.authenticate(authenticationToken);

        // Fetch the user after successful authentication
        User user = userService.getUserByEmail(loginRequest.getEmail());

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name());

        Map<String, Object> response = new HashMap<>();
        response.put("token", token);
        response.put("id", user.getId());
        response.put("name", user.getName());
        response.put("email", user.getEmail());
        response.put("role", user.getRole());
        response.put("accountStatus", user.getAccountStatus());
        response.put("approvalRequested", user.isApprovalRequested());
        response.put("rejectionCount", user.getRejectionCount());
        response.put("lastRejectionReason", user.getLastRejectionReason());

        return response;
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, String>> forgotPassword(@RequestBody ForgotPasswordRequest request) {
        if (request == null || request.getEmail() == null || request.getEmail().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email is required"));
        }
        passwordResetService.initiateReset(request.getEmail());
        return ResponseEntity.ok(Map.of("message", "If an account exists for that email, a reset link has been sent."));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, String>> resetPassword(@RequestBody ResetPasswordRequest request) {
        if (request == null
                || request.getToken() == null || request.getToken().isBlank()
                || request.getNewPassword() == null || request.getNewPassword().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Token and new password are required"));
        }
        passwordResetService.resetPassword(request.getToken(), request.getNewPassword());
        return ResponseEntity.ok(Map.of("message", "Password updated successfully"));
    }
}
//package com.rishi.ecom.controller;
//
//import com.rishi.ecom.dto.LoginRequest;
//import com.rishi.ecom.entity.User;
//import com.rishi.ecom.security.JwtUtil;
//import com.rishi.ecom.service.UserService;
//import lombok.AllArgsConstructor;
//import org.springframework.web.bind.annotation.*;
//
//import java.util.HashMap;
//import java.util.Map;
//
//@RestController
//@RequestMapping("/api/auth")
//@CrossOrigin(origins = "http://localhost:5173")
//@AllArgsConstructor
//public class AuthController {
//
//    private final UserService userService;
//    private final JwtUtil jwtUtil;
//
//    @PostMapping("/login")
//    public Map<String, Object> login(@RequestBody LoginRequest loginRequest) {
//        User user = userService.login(loginRequest.getEmail(), loginRequest.getPassword());
//
//        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name());
//
//        Map<String, Object> response = new HashMap<>();
//        response.put("token", token);
//        response.put("id", user.getId());
//        response.put("name", user.getName());
//        response.put("email", user.getEmail());
//        response.put("role", user.getRole());
//
//        return response;
//    }
//}
