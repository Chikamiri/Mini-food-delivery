package com.example.server.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.example.server.entity.Address;
import java.util.Optional;
import java.util.List;

@Repository
public interface AddressRepository extends JpaRepository<Address, Long> {
    List<Address> findByUserId(Long userId);

    Optional<Address> findByUserIdAndIsDefaultTrue(Long userId);
}
