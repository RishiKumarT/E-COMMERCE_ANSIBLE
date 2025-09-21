package com.rishi.ecom.controller;

import com.rishi.ecom.entity.User;
import com.rishi.ecom.security.JwtUtil;
import com.rishi.ecom.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:5173")
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
    public List<User> getAllUsers(@RequestHeader("Authorization") String authHeader) {
        User requester = getUserFromAuthHeader(authHeader);
        return userService.getAllUsers(requester);
    }

    // Get user by ID (Admin or self)
    @GetMapping("/{id}")
    public User getUser(@RequestHeader("Authorization") String authHeader, @PathVariable Long id) {
        User requester = getUserFromAuthHeader(authHeader);
        // allow admin or owner
        if (requester.getRole() != User.Role.ADMIN && !requester.getId().equals(id)) {
            throw new RuntimeException("Access denied!");
        }
        return userService.getUserById(id);
    }

    // Update user (Admin or self)
    @PutMapping("/{id}")
    public User updateUser(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long id,
            @RequestBody User updatedUser
    ) {
        User requester = getUserFromAuthHeader(authHeader);
        return userService.updateUser(requester, id, updatedUser);
    }

    // Delete user (Admin or self)
    @DeleteMapping("/{id}")
    public String deleteUser(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long id
    ) {
        User requester = getUserFromAuthHeader(authHeader);
        userService.deleteUser(requester, id);
        return "User deleted successfully!";
    }

    // Helper to extract authenticated User from header
    private User getUserFromAuthHeader(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new RuntimeException("Missing or invalid Authorization header");
        }
        String token = authHeader.substring(7);
        String email = jwtUtil.extractUsername(token);
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
