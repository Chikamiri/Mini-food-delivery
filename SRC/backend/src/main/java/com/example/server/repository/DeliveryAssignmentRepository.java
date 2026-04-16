package com.example.server.repository;

import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.JpaRepository;
import com.example.server.entity.DeliveryAssignment;
import java.util.Optional;
import java.util.List;

@Repository
public interface DeliveryAssignmentRepository extends JpaRepository<DeliveryAssignment, Long> {
    Optional<DeliveryAssignment> findByShipperIDIdAndStatusIn(Long shipperId, List<String> statuses);
}
