package com.rishi.ecom.repository;

import com.rishi.ecom.entity.User;
import com.rishi.ecom.entity.Wishlist;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface WishlistRepository extends JpaRepository<Wishlist, Long> {
    Optional<Wishlist> findByUser(User user);
}
