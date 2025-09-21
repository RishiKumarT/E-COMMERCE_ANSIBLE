package com.rishi.ecom.repository;

import com.rishi.ecom.entity.Order;
import com.rishi.ecom.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByCustomer(User customer);
}
