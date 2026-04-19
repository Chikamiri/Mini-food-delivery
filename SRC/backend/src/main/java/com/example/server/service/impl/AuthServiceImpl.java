package com.example.server.service.impl;

import com.example.server.dto.auth.JwtResponse;
import com.example.server.dto.auth.LoginRequest;
import com.example.server.dto.auth.RegisterRequest;
import com.example.server.entity.User;
import com.example.server.enums.Role;
import com.example.server.exception.AppException;
import com.example.server.repository.UserRepository;
import com.example.server.security.CustomUserDetails;
import com.example.server.security.JwtUtils;
import com.example.server.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;

    @Override
    public JwtResponse login(LoginRequest request) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));

            SecurityContextHolder.getContext().setAuthentication(authentication);
            String jwt = jwtUtils.generateToken(request.getEmail());

            CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
            String role = userDetails.getAuthorities().iterator().next().getAuthority().replace("ROLE_", "");

            return JwtResponse.builder()
                    .accessToken(jwt)
                    .tokenType("Bearer")
                    .email(userDetails.getEmail())
                    .fullName(userDetails.getEmail()) // Typically would get from a dedicated DTO or more complete
                                                      // UserDetails
                    .role(role)
                    .userId(userDetails.getId())
                    .build();
        } catch (Exception e) {
            throw new AppException(HttpStatus.UNAUTHORIZED, "Invalid email or password", "AUTH_FAILED");
        }
    }

    @Override
    @Transactional
    public JwtResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Email is already in use", "EMAIL_EXISTS");
        }

        User user = new User();
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setFullName(request.getFullName());
        user.setPhone(request.getPhone());
        user.setAvatarUrl(request.getAvatarUrl());
        user.setRole(Role.ROLE_CUSTOMER); // Default role
        user.setActive(true);
        user.setDeleted(false);

        userRepository.save(user);

        String jwt = jwtUtils.generateToken(user.getEmail());

        return JwtResponse.builder()
                .accessToken(jwt)
                .tokenType("Bearer")
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole())
                .userId(user.getId())
                .build();
    }
}
