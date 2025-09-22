package com.rishi.ecom.service;

import com.rishi.ecom.entity.*;
import com.rishi.ecom.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderItemRepository orderItemRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CartService cartService;

    @Autowired
    private UserService userService;

    /**
     * Place an order (convert cart -> order)
     * ✅ Decreases product stock when placing order
     * ✅ Throws error if stock is not sufficient
     */
    @Transactional
    public Order placeOrder(Long userId) {
        User user = userService.getUserById(userId);

        if (user.getRole() != User.Role.USER) {
            throw new RuntimeException("Only USERS can place orders!");
        }

        Cart cart = cartService.getCart(userId);
        if (cart.getItems().isEmpty()) {
            throw new RuntimeException("Cart is empty!");
        }

        // Validate stock before creating order
        for (CartItem cartItem : cart.getItems()) {
            Product product = cartItem.getProduct();
            if (product.getStockQuantity() < cartItem.getQuantity()) {
                throw new RuntimeException("Insufficient stock for product: " + product.getName());
            }
        }

        // Create Order
        Order order = Order.builder()
                .customer(user)
                .status("PLACED")
                .createdAt(LocalDateTime.now())
                .build();
        order = orderRepository.save(order);

        double total = 0;
        List<OrderItem> orderItems = new ArrayList<>();

        // Copy cart items into order items & update stock
        for (CartItem cartItem : cart.getItems()) {
            Product product = cartItem.getProduct();

            // Decrease stock
            product.setStockQuantity(product.getStockQuantity() - cartItem.getQuantity());
            productRepository.save(product);

            double price = product.getPrice();
            total += price * cartItem.getQuantity();

            OrderItem orderItem = OrderItem.builder()
                    .order(order)
                    .product(product)
                    .quantity(cartItem.getQuantity())
                    .priceAtPurchase(price)
                    .build();

            orderItems.add(orderItem);
        }

        order.setItems(orderItems);
        order.setTotalAmount(total);

        orderRepository.save(order);

        // Clear the cart after order
        cartService.clearCart(userId);

        return order;
    }

    /**
     * Get logged-in user's orders
     */
    public List<Order> getUserOrders(Long userId) {
        User user = userService.getUserById(userId);
        return orderRepository.findByCustomer(user);
    }

    /**
     * Admin gets all orders
     */
    public List<Order> getAllOrders(Long requesterId) {
        User requester = userService.getUserById(requesterId);
        if (requester.getRole() != User.Role.ADMIN) {
            throw new RuntimeException("Only ADMIN can view all orders!");
        }
        return orderRepository.findAll();
    }

    /**
     * Admin updates order status
     */
    public Order updateOrderStatus(Long requesterId, Long orderId, String status) {
        User requester = userService.getUserById(requesterId);
        if (requester.getRole() != User.Role.ADMIN) {
            throw new RuntimeException("Only ADMIN can update order status!");
        }

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        order.setStatus(status);
        return orderRepository.save(order);
    }

    /**
     * Cancel an order
     * ✅ Restores product stock for all items
     */
    @Transactional
    public Order cancelOrder(Long userId, Long orderId) {
        User user = userService.getUserById(userId);

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        // ✅ Only allow cancelling if user owns the order or is admin
        if (!order.getCustomer().getId().equals(userId) &&
            user.getRole() != User.Role.ADMIN) {
            throw new RuntimeException("You are not allowed to cancel this order");
        }

        // ✅ Allow cancel only if order is still PLACED
        if (!order.getStatus().equals("PLACED")) {
            throw new RuntimeException("Only PLACED orders can be cancelled");
        }

        // ✅ Restore stock for each product
        for (OrderItem orderItem : order.getItems()) {
            Product product = orderItem.getProduct();
            product.setStockQuantity(product.getStockQuantity() + orderItem.getQuantity());
            productRepository.save(product);
        }

        order.setStatus("CANCELLED");
        return orderRepository.save(order);
    }
}
