package com.rishi.ecom.controller;

import com.rishi.ecom.entity.User;
import com.rishi.ecom.entity.Wishlist;
import com.rishi.ecom.security.JwtUtil;
import com.rishi.ecom.service.UserService;
import com.rishi.ecom.service.WishlistService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/wishlist")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class WishlistController {

    private final WishlistService wishlistService;
    private final UserService userService;
    private final JwtUtil jwtUtil;

    @PostMapping("/add")
    public Wishlist addToWishlist(@RequestParam Long productId) {
        User user = getCurrentUser();
        return wishlistService.addToWishlist(user.getId(), productId);
    }

    @DeleteMapping("/remove")
    public Wishlist removeFromWishlist(@RequestParam Long productId) {
        User user = getCurrentUser();
        return wishlistService.removeFromWishlist(user.getId(), productId);
    }

    @GetMapping
    public Wishlist getWishlist() {
        User user = getCurrentUser();
        return wishlistService.getWishlist(user.getId());
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
//import com.rishi.ecom.entity.Wishlist;
//import com.rishi.ecom.service.WishlistService;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.web.bind.annotation.*;
//
//@RestController
//@RequestMapping("/api/wishlist")
//@CrossOrigin(origins = "http://localhost:5173")
//public class WishlistController {
//
//    @Autowired
//    private WishlistService wishlistService;
//
//    @PostMapping("/add")
//    public Wishlist addToWishlist(@RequestParam Long userId, @RequestParam Long productId) {
//        return wishlistService.addToWishlist(userId, productId);
//    }
//
//    @DeleteMapping("/remove")
//    public Wishlist removeFromWishlist(@RequestParam Long userId, @RequestParam Long productId) {
//        return wishlistService.removeFromWishlist(userId, productId);
//    }
//
//    @GetMapping
//    public Wishlist getWishlist(@RequestParam Long userId) {
//        return wishlistService.getWishlist(userId);
//    }
//}
