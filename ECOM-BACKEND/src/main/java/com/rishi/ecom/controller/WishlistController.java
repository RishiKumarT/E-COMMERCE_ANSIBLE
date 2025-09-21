package com.rishi.ecom.controller;

import com.rishi.ecom.entity.User;
import com.rishi.ecom.entity.Wishlist;
import com.rishi.ecom.security.JwtUtil;
import com.rishi.ecom.service.UserService;
import com.rishi.ecom.service.WishlistService;
import lombok.RequiredArgsConstructor;
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
    public Wishlist addToWishlist(@RequestHeader("Authorization") String authHeader,
                                  @RequestParam Long productId) {
        User user = getUserFromAuthHeader(authHeader);
        return wishlistService.addToWishlist(user.getId(), productId);
    }

    @DeleteMapping("/remove")
    public Wishlist removeFromWishlist(@RequestHeader("Authorization") String authHeader,
                                       @RequestParam Long productId) {
        User user = getUserFromAuthHeader(authHeader);
        return wishlistService.removeFromWishlist(user.getId(), productId);
    }

    @GetMapping
    public Wishlist getWishlist(@RequestHeader("Authorization") String authHeader) {
        User user = getUserFromAuthHeader(authHeader);
        return wishlistService.getWishlist(user.getId());
    }

    private User getUserFromAuthHeader(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) throw new RuntimeException("Missing Authorization header");
        String email = jwtUtil.extractUsername(authHeader.substring(7));
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
