package com.example.server.repository;

import com.example.server.entity.OwnerRequest;
import com.example.server.enums.OwnerRequestStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface OwnerRequestRepository extends JpaRepository<OwnerRequest, Long> {
    List<OwnerRequest> findByUserId(Long userId);
    List<OwnerRequest> findByStatus(OwnerRequestStatus status);
}
