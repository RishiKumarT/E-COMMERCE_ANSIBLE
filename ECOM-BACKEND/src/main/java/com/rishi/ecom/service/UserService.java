package com.rishi.ecom.service;

import com.rishi.ecom.dto.UserDetailResponse;
import com.rishi.ecom.entity.Order;
import com.rishi.ecom.entity.User;
import com.rishi.ecom.repository.OrderRepository;
import com.rishi.ecom.repository.ProductRepository;
import com.rishi.ecom.repository.UserRepository;
import com.rishi.ecom.service.mail.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private EmailService emailService;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private ProductRepository productRepository;

    public User registerUser(User user) {
        if (user.getRole() == User.Role.ADMIN) throw new RuntimeException("Cannot create Admin account!");
        if (userRepository.findByEmail(user.getEmail()).isPresent())
            throw new RuntimeException("Email already registered!");

        user.setPassword(passwordEncoder.encode(user.getPassword())); // encode
        if (user.getRole() == User.Role.SELLER) {
            user.setAccountStatus(User.AccountStatus.PENDING);
            user.setApprovalRequested(true);
            user.setRejectionCount(0);
            user.setLastRequestAt(LocalDateTime.now());
        } else {
            user.setAccountStatus(User.AccountStatus.APPROVED);
            user.setApprovalRequested(false);
        }
        return userRepository.save(user);
    }


    // Login (for AuthController)
    public User login(String email, String rawPassword) {
        Optional<User> user = userRepository.findByEmail(email);
        if (user.isPresent() && passwordEncoder.matches(rawPassword, user.get().getPassword())) {
            return user.get();
        }
        throw new RuntimeException("Invalid email or password");
    }

    // Role + ownership check
    public void canModify(User requester, Long targetUserId) {
        if (requester.getRole() != User.Role.ADMIN && !requester.getId().equals(targetUserId)) {
            throw new RuntimeException("Access denied!");
        }
    }

    // Admin: get all users
    public List<User> getAllUsers(User requester) {
        if (requester.getRole() != User.Role.ADMIN) {
            throw new RuntimeException("Access denied! Only Admin can view all users.");
        }
        return userRepository.findAll();
    }

    public List<User> getPendingSellers(User requester) {
        ensureAdmin(requester);
        return userRepository.findByRoleAndAccountStatus(User.Role.SELLER, User.AccountStatus.PENDING);
    }

    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    
    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

//    public User updateUser(User requester, Long id, User updatedUser) {
//        canModify(requester, id);
//        User user = getUserById(id);
//        user.setName(updatedUser.getName());
//        user.setEmail(updatedUser.getEmail());
//
//        // Update password only if provided
//        if (updatedUser.getPassword() != null && !updatedUser.getPassword().isEmpty()) {
//            user.setPassword(passwordEncoder.encode(updatedUser.getPassword()));
//        }
//
//        // Only Admin can update role
//        if (requester.getRole() == User.Role.ADMIN) {
//            user.setRole(updatedUser.getRole());
//        }
//        return userRepository.save(user);
//    }
    public User updateUser(User requester, Long id, User updatedUser) {
        canModify(requester, id);
        User user = getUserById(id);

        if (updatedUser.getName() != null) {
            user.setName(updatedUser.getName());
        }

        if (updatedUser.getEmail() != null) {
            user.setEmail(updatedUser.getEmail());
        }

        if (updatedUser.getPassword() != null && !updatedUser.getPassword().isEmpty()) {
            user.setPassword(passwordEncoder.encode(updatedUser.getPassword()));
        }

        if (requester.getRole() == User.Role.ADMIN && updatedUser.getRole() != null) {
            user.setRole(updatedUser.getRole());
        }

        return userRepository.save(user);
    }

    public void deleteUser(User requester, Long id) {
        canModify(requester, id);
        userRepository.delete(getUserById(id));
    }

    public UserDetailResponse getUserDetails(User requester, Long targetUserId) {
        if (requester.getRole() != User.Role.ADMIN && !requester.getId().equals(targetUserId)) {
            throw new RuntimeException("Access denied!");
        }

        User target = getUserById(targetUserId);
        long orderCount = 0;
        double totalSpend = 0;
        long productCount = 0;

        if (target.getRole() == User.Role.USER) {
            List<Order> orders = orderRepository.findByCustomer(target);
            orderCount = orders.size();
            totalSpend = orders.stream().mapToDouble(Order::getTotalAmount).sum();
        } else if (target.getRole() == User.Role.SELLER) {
            productCount = productRepository.countBySeller(target);
        }

        return UserDetailResponse.builder()
                .user(target)
                .orderCount(orderCount)
                .totalSpend(totalSpend)
                .productCount(productCount)
                .rejectionCount(target.getRejectionCount())
                .build();
    }

    public User approveSeller(User requester, Long sellerId) {
        ensureAdmin(requester);
        User seller = getSellerById(sellerId);

        seller.setAccountStatus(User.AccountStatus.APPROVED);
        seller.setApprovalRequested(false);
        seller.setLastDecisionAt(LocalDateTime.now());
        seller.setLastRejectionReason(null);

        User saved = userRepository.save(seller);
        emailService.sendSellerStatusEmail(saved,
                "Seller account approved",
                "Your seller account has been approved. You can now manage your products.");
        return saved;
    }

    public User rejectSeller(User requester, Long sellerId, String reason) {
        ensureAdmin(requester);
        if (reason == null || reason.isBlank()) {
            throw new RuntimeException("Rejection reason is required");
        }
        User seller = getSellerById(sellerId);

        seller.setAccountStatus(User.AccountStatus.REJECTED);
        seller.setApprovalRequested(false);
        seller.setRejectionCount(seller.getRejectionCount() + 1);
        seller.setLastDecisionAt(LocalDateTime.now());
        seller.setLastRejectionReason(reason);

        User saved = userRepository.save(seller);
        emailService.sendSellerStatusEmail(saved,
                "Seller account rejected",
                "Your seller account request was rejected.\nReason: " + reason);
        return saved;
    }

    public User requestSellerApproval(User requester) {
        if (requester.getRole() != User.Role.SELLER) {
            throw new RuntimeException("Only sellers can request approval");
        }
        User seller = getUserById(requester.getId());
        if (seller.getAccountStatus() == User.AccountStatus.APPROVED) {
            throw new RuntimeException("Seller already approved");
        }
        if (seller.isApprovalRequested()) {
            throw new RuntimeException("Approval request already in progress");
        }

        seller.setAccountStatus(User.AccountStatus.PENDING);
        seller.setApprovalRequested(true);
        seller.setLastRequestAt(LocalDateTime.now());

        return userRepository.save(seller);
    }

    public void ensureSellerApproved(User requester) {
        if (requester.getRole() == User.Role.SELLER
                && requester.getAccountStatus() != User.AccountStatus.APPROVED) {
            throw new RuntimeException("Seller account not approved yet");
        }
    }

    private User getSellerById(Long sellerId) {
        User seller = getUserById(sellerId);
        if (seller.getRole() != User.Role.SELLER) {
            throw new RuntimeException("User is not a seller");
        }
        return seller;
    }

    private void ensureAdmin(User requester) {
        if (requester.getRole() != User.Role.ADMIN) {
            throw new RuntimeException("Only Admin can perform this action");
        }
    }
}










//package com.rishi.ecom.service;
//
//import com.rishi.ecom.entity.User;
//import com.rishi.ecom.repository.UserRepository;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.stereotype.Service;
//
//import java.util.List;
//import java.util.Optional;
//
//@Service
//public class UserService {
//
//    @Autowired
//    private UserRepository userRepository;
//
//    // Register new USER or SELLER only
//    public User registerUser(User user) {
//        if (user.getRole() == User.Role.ADMIN) {
//            throw new RuntimeException("Cannot create Admin account!");
//        }
//        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
//            throw new RuntimeException("Email already registered!");
//        }
//        return userRepository.save(user);
//    }
//
//    // Simple login
//    public User login(String email, String password) {
//        Optional<User> user = userRepository.findByEmail(email);
//        if (user.isPresent() && user.get().getPassword().equals(password)) {
//            return user.get();
//        }
//        throw new RuntimeException("Invalid email or password");
//    }
//
//    // Role + ownership check
//    public void canModify(User requester, Long targetUserId) {
//        if (requester.getRole() != User.Role.ADMIN && !requester.getId().equals(targetUserId)) {
//            throw new RuntimeException("Access denied!");
//        }
//    }
//
//    // Admin: get all users
//    public List<User> getAllUsers(User requester) {
//        if (requester.getRole() != User.Role.ADMIN) {
//            throw new RuntimeException("Access denied! Only Admin can view all users.");
//        }
//        return userRepository.findAll();
//    }
//
//    public User getUserById(Long id) {
//        return userRepository.findById(id)
//                .orElseThrow(() -> new RuntimeException("User not found"));
//    }
//
//    public User updateUser(User requester, Long id, User updatedUser) {
//        canModify(requester, id);
//        User user = getUserById(id);
//        user.setName(updatedUser.getName());
//        user.setEmail(updatedUser.getEmail());
//        user.setPassword(updatedUser.getPassword());
//        // Only Admin can update role
//        if (requester.getRole() == User.Role.ADMIN) {
//            user.setRole(updatedUser.getRole());
//        }
//        return userRepository.save(user);
//    }
//
//    public void deleteUser(User requester, Long id) {
//        canModify(requester, id);
//        userRepository.delete(getUserById(id));
//    }
//}
