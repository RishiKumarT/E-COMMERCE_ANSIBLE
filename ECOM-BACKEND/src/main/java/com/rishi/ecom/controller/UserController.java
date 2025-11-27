package com.rishi.ecom.controller;

import com.rishi.ecom.dto.SellerDecisionRequest;
import com.rishi.ecom.dto.UserDetailResponse;
import com.rishi.ecom.entity.User;
import com.rishi.ecom.security.JwtUtil;
import com.rishi.ecom.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
//@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final JwtUtil jwtUtil;

    // Register new USER or SELLER
    @PostMapping("/register")
    public User register(@RequestBody User user) {
        return userService.registerUser(user);
    }

    // Admin: Get all users
    @GetMapping
    public List<User> getAllUsers() {
        User requester = getCurrentUser();
        return userService.getAllUsers(requester);
    }

    @GetMapping("/sellers/pending")
    public List<User> getPendingSellers() {
        User requester = getCurrentUser();
        return userService.getPendingSellers(requester);
    }

    // Get user by ID (Admin or self)
    @GetMapping("/{id}")
    public User getUser(@PathVariable Long id) {
        User requester = getCurrentUser();
        // allow admin or owner
        if (requester.getRole() != User.Role.ADMIN && !requester.getId().equals(id)) {
            throw new RuntimeException("Access denied!");
        }
        return userService.getUserById(id);
    }

    @GetMapping("/{id}/details")
    public UserDetailResponse getUserDetails(@PathVariable Long id) {
        User requester = getCurrentUser();
        return userService.getUserDetails(requester, id);
    }

    // Update user (Admin or self)
    @PutMapping("/{id}")
    public User updateUser(@PathVariable Long id, @RequestBody User updatedUser) {
        User requester = getCurrentUser();
        return userService.updateUser(requester, id, updatedUser);
    }

    // Delete user (Admin or self)
    @DeleteMapping("/{id}")
    public String deleteUser(@PathVariable Long id) {
        User requester = getCurrentUser();
        userService.deleteUser(requester, id);
        return "User deleted successfully!";
    }

    @PostMapping("/sellers/{id}/approve")
    public User approveSeller(@PathVariable Long id) {
        User requester = getCurrentUser();
        return userService.approveSeller(requester, id);
    }

    @PostMapping("/sellers/{id}/reject")
    public User rejectSeller(@PathVariable Long id, @RequestBody SellerDecisionRequest request) {
        User requester = getCurrentUser();
        return userService.rejectSeller(requester, id, request != null ? request.getReason() : null);
    }

    @PostMapping("/sellers/request-approval")
    public User requestApproval() {
        User requester = getCurrentUser();
        return userService.requestSellerApproval(requester);
    }

    // Helper to extract authenticated User from header
    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new RuntimeException("User not authenticated");
        }
        String email = authentication.getName();
        return userService.getUserByEmail(email);
    }

}



//package com.rishi.ecom.controller;
//
//import com.rishi.ecom.entity.User;
//import com.rishi.ecom.service.UserService;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.web.bind.annotation.*;
//
//import java.util.List;
//
//@RestController
//@RequestMapping("/api/users")
//@CrossOrigin(origins = "http://localhost:5173")
//public class UserController {
//
//    @Autowired
//    private UserService userService;
//
//    // ✅ Register new USER or SELLER
//    @PostMapping("/register")
//    public User register(@RequestBody User user) {
//        return userService.registerUser(user);
//    }
//
//    // ✅ Get all users (Admin only, protected by JWT)
//    @GetMapping
//    public List<User> getAllUsers(@RequestParam Long requesterId) {
//        User requester = userService.getUserById(requesterId);
//        return userService.getAllUsers(requester);
//    }
//
//    // ✅ Get user by ID (Admin or self)
//    @GetMapping("/{id}")
//    public User getUser(@PathVariable Long id) {
//        return userService.getUserById(id);
//    }
//
//    // ✅ Update user (Admin or self)
//    @PutMapping("/{id}")
//    public User updateUser(
//            @PathVariable Long id,
//            @RequestParam Long requesterId,
//            @RequestBody User updatedUser
//    ) {
//        User requester = userService.getUserById(requesterId);
//        return userService.updateUser(requester, id, updatedUser);
//    }
//
//    // ✅ Delete user (Admin or self)
//    @DeleteMapping("/{id}")
//    public String deleteUser(
//            @PathVariable Long id,
//            @RequestParam Long requesterId
//    ) {
//        User requester = userService.getUserById(requesterId);
//        userService.deleteUser(requester, id);
//        return "User deleted successfully!";
//    }
//}
