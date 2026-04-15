package com.example.server.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.example.server.entity.User;
import java.util.*;

@Repository
public interface UserRepo extends JpaRepository<User, Long> {
    // Auth
    Optional<User> findByEmail(String email);

    Optional<User> findByEmailAndActiveTrueAndDeletedFalse(String email);

    boolean existsByEmail(String email);

    boolean existsByPhone(String phone);

    // Active/Deleted
    List<User> findAllByActiveTrue();

    // Active & Deleted
    Optional<User> findByIdAndDeletedFalse(Long id);

    // Role
    List<User> findAllByRole(String role);

    List<User> findAllByRoleAndActiveTrueAndDeletedFalse(String role);

    // Search
    Page<User> findByFullnameContainingIgnoreCaseOrEmailContainingIgnoreCase(String fullname, String email,
            Pageable pageable);
}