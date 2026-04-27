package com.example.server.repository;

import com.example.server.entity.DeliveryAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DeliveryAssignmentRepository extends JpaRepository<DeliveryAssignment, Long> {
    Optional<DeliveryAssignment> findByOrderId(Long orderId);
    Optional<DeliveryAssignment> findByShipperIdAndStatusIn(Long shipperId, List<String> statuses);
    List<DeliveryAssignment> findAllByShipperIsNullAndStatus(String status);
    List<DeliveryAssignment> findAllByShipperId(Long shipperId);
    List<DeliveryAssignment> findAllByOrderIdIn(List<Long> orderIds);
}
