package com.rishi.ecom.repository;

import com.rishi.ecom.entity.OrderItem;
import com.rishi.ecom.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {
    List<OrderItem> findByProduct(Product product);
}