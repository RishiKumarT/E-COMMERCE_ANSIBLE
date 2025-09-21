package com.rishi.ecom.service;

import com.rishi.ecom.entity.Product;
import com.rishi.ecom.entity.User;
import com.rishi.ecom.entity.Wishlist;
import com.rishi.ecom.repository.ProductRepository;
import com.rishi.ecom.repository.WishlistRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class WishlistService {

    @Autowired
    private WishlistRepository wishlistRepository;

    @Autowired
    private UserService userService;

    @Autowired
    private ProductRepository productRepository;

    // Get or create a wishlist for user
    private Wishlist getOrCreateWishlist(User user) {
        return wishlistRepository.findByUser(user)
                .orElseGet(() -> wishlistRepository.save(Wishlist.builder()
                        .user(user)
                        .products(new java.util.ArrayList<>())
                        .build()));
    }

    // Add product to wishlist
    public Wishlist addToWishlist(Long userId, Long productId) {
        User user = userService.getUserById(userId);
        if (user.getRole() != User.Role.USER) {
            throw new RuntimeException("Only USERS can have wishlists!");
        }

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        Wishlist wishlist = getOrCreateWishlist(user);

        if (!wishlist.getProducts().contains(product)) {
            wishlist.getProducts().add(product);
        }

        return wishlistRepository.save(wishlist);
    }

    // Remove product from wishlist
    public Wishlist removeFromWishlist(Long userId, Long productId) {
        User user = userService.getUserById(userId);
        Wishlist wishlist = getOrCreateWishlist(user);

        wishlist.getProducts().removeIf(p -> p.getId().equals(productId));
        return wishlistRepository.save(wishlist);
    }

    // Get user's wishlist
    public Wishlist getWishlist(Long userId) {
        User user = userService.getUserById(userId);
        return getOrCreateWishlist(user);
    }
}
