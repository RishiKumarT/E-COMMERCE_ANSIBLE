package com.rishi.ecom.service.mail;

import com.rishi.ecom.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.from:trishik05@gmail.com}")
    private String fromAddress;

    @Value("${app.mail.enabled:false}")
    private boolean mailEnabled;

    public void sendSellerStatusEmail(User seller, String subject, String body) {
        sendEmail(seller.getEmail(), subject, body);
    }

    public void sendPasswordResetEmail(User user, String resetLink) {
        String body = """
                Hello %s,

                A password reset was requested for your account. If this was you, click the link below to set a new password:
                %s

                If you did not request this, please ignore this email.
                """.formatted(user.getName(), resetLink);
        sendEmail(user.getEmail(), "Reset your password", body);
    }

    private void sendEmail(String to, String subject, String body) {
        if (!mailEnabled) {
            log.info("Mail delivery disabled. Skipping email to {} with subject {}", to, subject);
            return;
        }
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(to);
            message.setFrom(fromAddress);
            message.setSubject(subject);
            message.setText(body);
            mailSender.send(message);
        } catch (Exception ex) {
            log.error("Failed to send email to {}", to, ex);
        }
    }
}

