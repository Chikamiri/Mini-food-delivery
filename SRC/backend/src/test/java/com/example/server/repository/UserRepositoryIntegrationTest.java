package com.example.server.repository;

import com.example.server.BaseIntegrationTest;
import com.example.server.entity.User;
import com.example.server.enums.Role;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

class UserRepositoryIntegrationTest extends BaseIntegrationTest {

    @Autowired
    private UserRepository userRepository;

    @Test
    void shouldReturnUserWhenSearchingByEmail() {
        // Arrange
        User user = User.builder()
                .email("repo-test@example.com")
                .password("password")
                .fullName("Repo Test")
                .role(Role.ROLE_CUSTOMER)
                .active(true)
                .build();
        userRepository.save(user);

        // Act
        Optional<User> found = userRepository.findByEmail("repo-test@example.com");

        // Assert
        assertTrue(found.isPresent());
        assertEquals("Repo Test", found.get().getFullName());
    }

    @Test
    void shouldReturnTrueWhenEmailExists() {
        // Arrange
        User user = User.builder()
                .email("exists@example.com")
                .password("password")
                .fullName("Exists Test")
                .role(Role.ROLE_CUSTOMER)
                .active(true)
                .build();
        userRepository.save(user);

        // Act & Assert
        assertTrue(userRepository.existsByEmail("exists@example.com"));
        assertFalse(userRepository.existsByEmail("not-exists@example.com"));
    }

    @Test
    void shouldReturnActiveUsersWhenSearchingByRole() {
        // Arrange
        User user1 = User.builder()
                .email("shipper1@example.com")
                .password("password")
                .fullName("Shipper 1")
                .role(Role.ROLE_SHIPPER)
                .active(true)
                .build();
        User user2 = User.builder()
                .email("shipper2@example.com")
                .password("password")
                .fullName("Shipper 2")
                .role(Role.ROLE_SHIPPER)
                .active(false) // Inactive
                .build();
        userRepository.saveAll(List.of(user1, user2));

        // Act
        List<User> shippers = userRepository.findByRoleAndActiveTrue(Role.ROLE_SHIPPER);

        // Assert
        assertFalse(shippers.isEmpty());
        assertTrue(shippers.stream().anyMatch(u -> u.getEmail().equals("shipper1@example.com")));
        assertTrue(shippers.stream().noneMatch(u -> u.getEmail().equals("shipper2@example.com")));
    }
}
