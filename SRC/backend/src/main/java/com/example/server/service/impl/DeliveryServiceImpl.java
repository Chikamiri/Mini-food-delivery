package com.example.server.service.impl;

import com.example.server.dto.delivery.*;
import com.example.server.entity.*;
import com.example.server.enums.DeliveryAssignmentStatus;
import com.example.server.enums.OrderStatus;
import com.example.server.exception.ResourceNotFoundException;
import com.example.server.exception.AppException;
import com.example.server.mapper.DeliveryMapper;
import com.example.server.repository.*;
import com.example.server.service.DeliveryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class DeliveryServiceImpl implements DeliveryService {

    private final DeliveryAssignmentRepository deliveryAssignmentRepository;
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final ShipperLocationRepository shipperLocationRepository;
    private final DeliveryMapper deliveryMapper;

    @Override
    @Transactional
    public DeliveryAssignmentResponse assignShipper(AssignShipperRequest request) {
        Order order = orderRepository.findById(request.getOrderId())
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", request.getOrderId()));

        User shipper = userRepository.findById(request.getShipperId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", request.getShipperId()));

        if (!"SHIPPER".equals(shipper.getRole())) {
            throw new AppException(HttpStatus.BAD_REQUEST, "User is not a shipper", "INVALID_ROLE");
        }

        DeliveryAssignment assignment = new DeliveryAssignment();
        assignment.setOrder(order);
        assignment.setShipper(shipper);
        assignment.setStatus(DeliveryAssignmentStatus.ASSIGNED.name());

        // Update order status to SHIPPING if it was READY
        if (OrderStatus.READY.name().equals(order.getStatus())) {
            order.setStatus(OrderStatus.SHIPPING.name());
            orderRepository.save(order);
        }

        return deliveryMapper.toResponse(deliveryAssignmentRepository.save(assignment));
    }

    @Override
    @Transactional
    public void markPickedUp(Long shipperId, Long orderId, MarkPickupRequest request) {
        DeliveryAssignment assignment = deliveryAssignmentRepository.findByOrderId(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("DeliveryAssignment", "orderId", orderId));

        if (!assignment.getShipper().getId().equals(shipperId)) {
            throw new AppException(HttpStatus.FORBIDDEN, "Unauthorized to update this assignment", "UNAUTHORIZED_UPDATE");
        }

        assignment.setStatus(DeliveryAssignmentStatus.PICKED_UP.name());
        assignment.setPickedUpAt(LocalDateTime.now());
        deliveryAssignmentRepository.save(assignment);
    }

    @Override
    @Transactional
    public void markDelivered(Long shipperId, Long orderId, MarkDeliveredRequest request) {
        DeliveryAssignment assignment = deliveryAssignmentRepository.findByOrderId(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("DeliveryAssignment", "orderId", orderId));

        if (!assignment.getShipper().getId().equals(shipperId)) {
            throw new AppException(HttpStatus.FORBIDDEN, "Unauthorized to update this assignment", "UNAUTHORIZED_UPDATE");
        }
        assignment.setStatus(DeliveryAssignmentStatus.DELIVERED.name());
        assignment.setDeliveredAt(LocalDateTime.now());
        deliveryAssignmentRepository.save(assignment);

        // Update order status to DELIVERED
        Order order = assignment.getOrder();
        order.setStatus(OrderStatus.DELIVERED.name());
        orderRepository.save(order);
    }

    @Override
    @Transactional
    public void updateLocation(Long shipperId, ShipperLocationUpdateRequest request) {
        ShipperLocation location = shipperLocationRepository.findByShipperId(shipperId)
                .orElseGet(() -> {
                    User shipper = userRepository.findById(shipperId)
                            .orElseThrow(() -> new ResourceNotFoundException("User", "id", shipperId));
                    ShipperLocation newLoc = new ShipperLocation();
                    newLoc.setShipper(shipper);
                    return newLoc;
                });

        location.setLatitude(request.getLatitude());
        location.setLongitude(request.getLongitude());
        location.setIsOnline(request.getIsOnline());
        shipperLocationRepository.save(location);
    }

    @Override
    public ShipperLocationResponse getShipperLocation(Long shipperId) {
        ShipperLocation location = shipperLocationRepository.findByShipperId(shipperId)
                .orElseThrow(() -> new ResourceNotFoundException("ShipperLocation", "shipperId", shipperId));
        return deliveryMapper.toLocationResponse(location);
    }
}
