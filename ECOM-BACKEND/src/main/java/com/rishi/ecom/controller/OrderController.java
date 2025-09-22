package com.rishi.ecom.controller;

import com.rishi.ecom.entity.Order;
import com.rishi.ecom.entity.User;
import com.rishi.ecom.security.JwtUtil;
import com.rishi.ecom.service.OrderService;
import com.rishi.ecom.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;
    private final UserService userService;
    private final JwtUtil jwtUtil;

    // Place order for authenticated user
    @PostMapping("/place")
    public Order placeOrder() {
        User user = getCurrentUser();
        return orderService.placeOrder(user.getId());
    }

    // User gets own orders
    @GetMapping("/my")
    public List<Order> getUserOrders() {
        User user = getCurrentUser();
        return orderService.getUserOrders(user.getId());
    }

    // Admin gets all orders
    @GetMapping("/all")
    public List<Order> getAllOrders() {
        User admin = getCurrentUser();
        if (admin.getRole() != User.Role.ADMIN) {
            throw new RuntimeException("Only ADMIN can view all orders!");
        }
        return orderService.getAllOrders(admin.getId());
    }

    // Admin updates order status
    @PutMapping("/status/{orderId}")
    public Order updateStatus(@PathVariable Long orderId, @RequestParam String status) {
        User admin = getCurrentUser();
        if (admin.getRole() != User.Role.ADMIN) {
            throw new RuntimeException("Only ADMIN can update order status!");
        }
        return orderService.updateOrderStatus(admin.getId(), orderId, status);
    }
    @PutMapping("/cancel/{orderId}")
    public Order cancelOrder(@PathVariable Long orderId) {
        User user = getCurrentUser();
        return orderService.cancelOrder(user.getId(), orderId);
    }

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
//import com.rishi.ecom.entity.Order;
//import com.rishi.ecom.service.OrderService;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.web.bind.annotation.*;
//
//import java.util.List;
//
//@RestController
//@RequestMapping("/api/orders")
//@CrossOrigin(origins = "http://localhost:5173")
//public class OrderController {
//
//    @Autowired
//    private OrderService orderService;
//
//    // Place order from cart
//    @PostMapping("/{userId}/place")
//    public Order placeOrder(@PathVariable Long userId) {
//        return orderService.placeOrder(userId);
//    }
//
//    // User gets own orders
//    @GetMapping("/{userId}")
//    public List<Order> getUserOrders(@PathVariable Long userId) {
//        return orderService.getUserOrders(userId);
//    }
//
//    // Admin gets all orders
//    @GetMapping("/all/{adminId}")
//    public List<Order> getAllOrders(@PathVariable Long adminId) {
//        return orderService.getAllOrders(adminId);
//    }
//
//    // Admin updates order status
//    @PutMapping("/{adminId}/status/{orderId}")
//    public Order updateStatus(@PathVariable Long adminId,
//                              @PathVariable Long orderId,
//                              @RequestParam String status) {
//        return orderService.updateOrderStatus(adminId, orderId, status);
//    }
//}
