package com.example.server.security;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
class JwtUtilsTest {

    @Autowired
    private JwtUtils jwtUtils;

    @Test
    void shouldGenerateAndValidateToken() {
        String username = "testuser@example.com";
        String token = jwtUtils.generateToken(username);

        assertNotNull(token);
        assertTrue(jwtUtils.validateToken(token));
        assertEquals(username, jwtUtils.getUsernameFromToken(token));
    }

    @Test
    void shouldFailForInvalidToken() {
        String invalidToken = "invalid.token.here";
        assertFalse(jwtUtils.validateToken(invalidToken));
    }
}
