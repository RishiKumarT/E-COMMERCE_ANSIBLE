package com.rishi.ecom.config;

import com.rishi.ecom.entity.User;
import com.rishi.ecom.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import jakarta.annotation.PostConstruct;

@Component
public class DataLoader {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostConstruct
    public void init() {
        if (userRepository.findByEmail("admin@shop.com").isEmpty()) {
            User admin = User.builder()
                    .name("Super Admin")
                    .email("admin@shop.com")
                    .password(passwordEncoder.encode("admin123")) // encode here
                    .role(User.Role.ADMIN)
                    .accountStatus(User.AccountStatus.APPROVED)
                    .build();
            userRepository.save(admin);
        }
    }
}
