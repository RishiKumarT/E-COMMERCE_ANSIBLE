package com.rishi.ecom.service;

import com.rishi.ecom.entity.PasswordResetToken;
import com.rishi.ecom.entity.User;
import com.rishi.ecom.repository.PasswordResetTokenRepository;
import com.rishi.ecom.repository.UserRepository;
import com.rishi.ecom.service.mail.EmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PasswordResetService {

    private final UserRepository userRepository;
    private final PasswordResetTokenRepository tokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    @Value("${app.reset.base-url:http://localhost:5173/reset-password}")
    private String resetBaseUrl;

    @Value("${app.reset.token-valid-hours:2}")
    private int tokenValidHours;

    @Transactional
    public void initiateReset(String email) {
        userRepository.findByEmail(email).ifPresent(user -> {
            purgeExpiredTokens();

            String token = UUID.randomUUID().toString();
            PasswordResetToken resetToken = PasswordResetToken.builder()
                    .user(user)
                    .token(token)
                    .expiresAt(LocalDateTime.now().plusHours(tokenValidHours))
                    .used(false)
                    .build();
            tokenRepository.save(resetToken);

            String link = String.format("%s?token=%s", resetBaseUrl, token);
            emailService.sendPasswordResetEmail(user, link);
        });
    }

    @Transactional
    public void resetPassword(String token, String newPassword) {
        PasswordResetToken resetToken = tokenRepository.findByToken(token)
                .orElseThrow(() -> new RuntimeException("Invalid reset token"));

        if (resetToken.isUsed() || resetToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Reset token expired or already used");
        }

        User user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        resetToken.setUsed(true);
        resetToken.setUsedAt(LocalDateTime.now());
        tokenRepository.save(resetToken);
    }

    private void purgeExpiredTokens() {
        tokenRepository.deleteByExpiresAtBefore(LocalDateTime.now().minusDays(1));
    }
}


