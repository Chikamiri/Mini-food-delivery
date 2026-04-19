package com.example.server.service.impl;

import com.example.server.dto.auth.JwtResponse;
import com.example.server.dto.auth.LoginRequest;
import com.example.server.dto.auth.RegisterRequest;
import com.example.server.entity.User;
import com.example.server.repository.UserRepository;
import com.example.server.security.CustomUserDetails;
import com.example.server.security.JwtUtils;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceImplTest {

    @Mock
    private AuthenticationManager authenticationManager;
    @Mock
    private UserRepository userRepository;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private JwtUtils jwtUtils;

    @InjectMocks
    private AuthServiceImpl authService;

    private User user;
    private final String email = "test@example.com";
    private final String password = "password123";

    @BeforeEach
    void setUp() {
        user = new User();
        user.setId(1L);
        user.setEmail(email);
        user.setPassword("hashedPassword");
        user.setFullName("Test User");
        user.setRole("CUSTOMER");
    }

    @Test
    void register_Success() {
        RegisterRequest request = new RegisterRequest(email, password, "Test User", "12345678", null);
        when(userRepository.existsByEmail(email)).thenReturn(false);
        when(passwordEncoder.encode(password)).thenReturn("hashedPassword");
        when(jwtUtils.generateToken(email)).thenReturn("mockJwt");

        JwtResponse response = authService.register(request);

        assertNotNull(response);
        assertEquals("Bearer", response.getTokenType());
        assertEquals("mockJwt", response.getAccessToken());
        verify(userRepository).save(any(User.class));
    }

    @Test
    void login_Success() {
        LoginRequest request = new LoginRequest(email, password);
        Authentication authentication = mock(Authentication.class);
        CustomUserDetails userDetails = CustomUserDetails.build(user);

        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(authentication);
        when(authentication.getPrincipal()).thenReturn(userDetails);
        when(jwtUtils.generateToken(email)).thenReturn("mockJwt");

        JwtResponse response = authService.login(request);

        assertNotNull(response);
        assertEquals("mockJwt", response.getAccessToken());
        assertEquals(email, response.getEmail());
    }
}
