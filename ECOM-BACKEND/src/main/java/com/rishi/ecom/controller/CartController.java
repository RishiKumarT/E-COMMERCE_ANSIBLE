package com.rishi.ecom.controller;

import com.rishi.ecom.entity.Cart;
import com.rishi.ecom.entity.User;
import com.rishi.ecom.security.JwtUtil;
import com.rishi.ecom.service.CartService;
import com.rishi.ecom.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;
    private final UserService userService;
    private final JwtUtil jwtUtil;

    // Get authenticated user's cart
    @GetMapping
    public Cart getCart() {
        User user = getCurrentUser();
        return cartService.getCart(user.getId());
    }

    // Add product to cart (user)
    @PostMapping("/add")
    public Cart addToCart(@RequestParam Long productId, @RequestParam int quantity) {
        User user = getCurrentUser();
        return cartService.addToCart(user.getId(), productId, quantity);
    }

    // Remove item
    @DeleteMapping("/remove/{cartItemId}")
    public Cart removeFromCart(@PathVariable Long cartItemId) {
        User user = getCurrentUser();
        return cartService.removeFromCart(user.getId(), cartItemId);
    }

    // Clear cart
    @DeleteMapping("/clear")
    public Cart clearCart() {
        User user = getCurrentUser();
        return cartService.clearCart(user.getId());
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
//import com.rishi.ecom.entity.Cart;
//import com.rishi.ecom.service.CartService;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.web.bind.annotation.*;
//
//@RestController
//@RequestMapping("/api/cart")
//@CrossOrigin(origins = "http://localhost:5173")
//public class CartController {
//
//    @Autowired
//    private CartService cartService;
//
//    @GetMapping("/{userId}")
//    public Cart getCart(@PathVariable Long userId) {
//        return cartService.getCart(userId);
//    }
//
//    @PostMapping("/{userId}/add")
//    public Cart addToCart(@PathVariable Long userId,
//                          @RequestParam Long productId,
//                          @RequestParam int quantity) {
//        return cartService.addToCart(userId, productId, quantity);
//    }
//
//    @DeleteMapping("/{userId}/remove/{cartItemId}")
//    public Cart removeFromCart(@PathVariable Long userId,
//                               @PathVariable Long cartItemId) {
//        return cartService.removeFromCart(userId, cartItemId);
//    }
//
//    @DeleteMapping("/{userId}/clear")
//    public Cart clearCart(@PathVariable Long userId) {
//        return cartService.clearCart(userId);
//    }
//}
