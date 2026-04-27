package com.example.server.repository;

import com.example.server.entity.ShipperRequest;
import com.example.server.enums.ShipperRequestStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ShipperRequestRepository extends JpaRepository<ShipperRequest, Long> {
    List<ShipperRequest> findByUserId(Long userId);
    List<ShipperRequest> findByStatus(ShipperRequestStatus status);
}
