package com.example.server.repository;

import com.example.server.BaseIntegrationTest;
import com.example.server.entity.Address;
import com.example.server.entity.User;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;

import static org.junit.jupiter.api.Assertions.*;

@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
class EntityMappingIntegrationTest extends BaseIntegrationTest {

    @Autowired
    private UserRepository userRepository;

    @Test
    void shouldCascadeSaveAddresses() {
        User user = new User();
        user.setEmail("cascade@test.com");
        user.setPassword("password");
        user.setFullName("Cascade Test");
        user.setRole("CUSTOMER");
        user.setCreatedAt(java.time.LocalDateTime.now());
        user.setUpdatedAt(java.time.LocalDateTime.now());

        Address address = new Address();
        address.setAddressLine("123 Test St");
        address.setIsDefault(true);
        address.setUser(user);

        if (user.getAddresses() == null) {
            user.setAddresses(new ArrayList<>());
        }
        user.getAddresses().add(address);

        User savedUser = userRepository.save(user);
        userRepository.flush();

        assertNotNull(savedUser.getId());
        assertEquals(1, savedUser.getAddresses().size());
        assertNotNull(savedUser.getAddresses().get(0).getId());
    }

    @Test
    void shouldThrowExceptionWhenDuplicateEmail() {
        User user1 = new User();
        user1.setEmail("duplicate@test.com");
        user1.setPassword("password");
        user1.setFullName("User 1");
        user1.setRole("CUSTOMER");
        user1.setCreatedAt(java.time.LocalDateTime.now());
        user1.setUpdatedAt(java.time.LocalDateTime.now());
        userRepository.saveAndFlush(user1);

        User user2 = new User();
        user2.setEmail("duplicate@test.com");
        user2.setPassword("password");
        user2.setFullName("User 2");
        user2.setRole("CUSTOMER");
        user2.setCreatedAt(java.time.LocalDateTime.now());
        user2.setUpdatedAt(java.time.LocalDateTime.now());

        assertThrows(DataIntegrityViolationException.class, () -> {
            userRepository.saveAndFlush(user2);
        });
    }
}
