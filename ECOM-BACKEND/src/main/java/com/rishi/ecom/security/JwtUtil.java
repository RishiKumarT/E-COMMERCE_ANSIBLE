package com.rishi.ecom.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;

@Component
public class JwtUtil {

    // Generate a secure 256-bit key for HS256
    private static final Key SECRET_KEY = Keys.secretKeyFor(SignatureAlgorithm.HS256);

    private static final long EXPIRATION_TIME = 1000 * 60 * 60 * 10; // 10 hours

    // Generate JWT token
    public String generateToken(String username, String role) {
        return Jwts.builder()
                .setSubject(username)
                .claim("role", role)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME))
                .signWith(SECRET_KEY) // secure key
                .compact();
    }

    // Extract claims from JWT
    public Claims extractClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(SECRET_KEY)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    public String extractUsername(String token) {
        return extractClaims(token).getSubject();
    }

    public String extractRole(String token) {
        return extractClaims(token).get("role", String.class);
    }

    public boolean validateToken(String token, String username) {
        return username.equals(extractUsername(token)) && !isTokenExpired(token);
    }

    private boolean isTokenExpired(String token) {
        return extractClaims(token).getExpiration().before(new Date());
    }
}
//package com.rishi.ecom.security;
//
//import io.jsonwebtoken.Jwts;
//import io.jsonwebtoken.SignatureAlgorithm;
//import io.jsonwebtoken.Claims;
//import org.springframework.stereotype.Component;
//
//import java.util.Date;
//
//@Component
//public class JwtUtil {
//
//    private final String SECRET_KEY = "yourSecretKey123"; // change this to a strong secret!
//    private final long EXPIRATION_TIME = 1000 * 60 * 60 * 10; // 10 hours
//
//    public String generateToken(String username, String role) {
//        return Jwts.builder()
//                .setSubject(username)
//                .claim("role", role)
//                .setIssuedAt(new Date())
//                .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME))
//                .signWith(SignatureAlgorithm.HS256, SECRET_KEY)
//                .compact();
//    }
//
//    public Claims extractClaims(String token) {
//        return Jwts.parser()
//                .setSigningKey(SECRET_KEY)
//                .parseClaimsJws(token)
//                .getBody();
//    }
//
//    public String extractUsername(String token) {
//        return extractClaims(token).getSubject();
//    }
//
//    public String extractRole(String token) {
//        return extractClaims(token).get("role", String.class);
//    }
//
//    public boolean validateToken(String token, String username) {
//        return username.equals(extractUsername(token)) && !isTokenExpired(token);
//    }
//
//    private boolean isTokenExpired(String token) {
//        return extractClaims(token).getExpiration().before(new Date());
//    }
//}
//
//
////package com.rishi.ecom.security;
////
////import io.jsonwebtoken.*;
////import io.jsonwebtoken.security.Keys;
////import org.springframework.stereotype.Component;
////
////import java.security.Key;
////import java.util.Date;
////
////@Component
////public class JwtUtil {
////
////    private final String SECRET = "thisIsASecretKeyForJwtTokenGeneration12345"; // keep in env variable
////    private final long EXPIRATION = 1000 * 60 * 60 * 10; // 10 hours
////
////    private Key getSigningKey() {
////        return Keys.hmacShaKeyFor(SECRET.getBytes());
////    }
////
////    // Generate token
////    public String generateToken(String email, String role) {
////        return Jwts.builder()
////                .setSubject(email)
////                .claim("role", role)
////                .setIssuedAt(new Date())
////                .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION))
////                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
////                .compact();
////    }
////
////    // Extract email
////    public String extractEmail(String token) {
////        return extractClaims(token).getSubject();
////    }
////
////    // Extract role
////    public String extractRole(String token) {
////        return extractClaims(token).get("role", String.class);
////    }
////
////    private Claims extractClaims(String token) {
////        return Jwts.parserBuilder()
////                .setSigningKey(getSigningKey())
////                .build()
////                .parseClaimsJws(token)
////                .getBody();
////    }
////
////    // Validate token
////    public boolean validateToken(String token, String email) {
////        return email.equals(extractEmail(token)) && !isTokenExpired(token);
////    }
////
////    private boolean isTokenExpired(String token) {
////        return extractClaims(token).getExpiration().before(new Date());
////    }
////}
////
////
////
////
////
