package com.example.server.service.impl;

import com.example.server.dto.delivery.*;
import com.example.server.entity.*;
import com.example.server.enums.DeliveryAssignmentStatus;
import com.example.server.enums.OrderStatus;
import com.example.server.exception.AppException;
import com.example.server.mapper.DeliveryMapper;
import com.example.server.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DeliveryServiceImplTest {

    @Mock
    private DeliveryAssignmentRepository deliveryAssignmentRepository;
    @Mock
    private OrderRepository orderRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private ShipperLocationRepository shipperLocationRepository;
    @Mock
    private DeliveryMapper deliveryMapper;

    @InjectMocks
    private DeliveryServiceImpl deliveryService;

    private User shipper;
    private Order order;
    private DeliveryAssignment assignment;
    private final Long shipperId = 1L;
    private final Long orderId = 10L;

    @BeforeEach
    void setUp() {
        shipper = new User();
        shipper.setId(shipperId);
        shipper.setRole("SHIPPER");
        shipper.setFullName("Test Shipper");

        order = new Order();
        order.setId(orderId);
        order.setStatus(OrderStatus.READY.name());

        assignment = new DeliveryAssignment();
        assignment.setId(100L);
        assignment.setOrder(order);
        assignment.setShipper(shipper);
        assignment.setStatus(DeliveryAssignmentStatus.ASSIGNED.name());
    }

    @Test
    void assignShipper_Success() {
        AssignShipperRequest request = new AssignShipperRequest(orderId, shipperId);
        when(orderRepository.findById(orderId)).thenReturn(Optional.of(order));
        when(userRepository.findById(shipperId)).thenReturn(Optional.of(shipper));
        when(deliveryAssignmentRepository.save(any(DeliveryAssignment.class))).thenReturn(assignment);
        when(deliveryMapper.toResponse(any(DeliveryAssignment.class))).thenReturn(new DeliveryAssignmentResponse());

        deliveryService.assignShipper(request);

        assertEquals(OrderStatus.SHIPPING.name(), order.getStatus());
        verify(orderRepository).save(order);
        verify(deliveryAssignmentRepository).save(any(DeliveryAssignment.class));
    }

    @Test
    void assignShipper_NotAShipper_ShouldThrowException() {
        AssignShipperRequest request = new AssignShipperRequest(orderId, shipperId);
        shipper.setRole("CUSTOMER");
        when(orderRepository.findById(orderId)).thenReturn(Optional.of(order));
        when(userRepository.findById(shipperId)).thenReturn(Optional.of(shipper));

        AppException exception = assertThrows(AppException.class, () -> deliveryService.assignShipper(request));
        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatus());
        assertEquals("INVALID_ROLE", exception.getErrorCode());
    }

    @Test
    void markPickedUp_Success() {
        when(deliveryAssignmentRepository.findByOrderId(orderId)).thenReturn(Optional.of(assignment));

        deliveryService.markPickedUp(shipperId, orderId, new MarkPickupRequest());

        assertEquals(DeliveryAssignmentStatus.PICKED_UP.name(), assignment.getStatus());
        assertNotNull(assignment.getPickedUpAt());
        verify(deliveryAssignmentRepository).save(assignment);
    }

    @Test
    void markPickedUp_Unauthorized_ShouldThrowException() {
        when(deliveryAssignmentRepository.findByOrderId(orderId)).thenReturn(Optional.of(assignment));

        AppException exception = assertThrows(AppException.class,
                () -> deliveryService.markPickedUp(2L, orderId, new MarkPickupRequest()));
        assertEquals(HttpStatus.FORBIDDEN, exception.getStatus());
    }

    @Test
    void markDelivered_Success() {
        when(deliveryAssignmentRepository.findByOrderId(orderId)).thenReturn(Optional.of(assignment));

        deliveryService.markDelivered(shipperId, orderId, new MarkDeliveredRequest());

        assertEquals(DeliveryAssignmentStatus.DELIVERED.name(), assignment.getStatus());
        assertEquals(OrderStatus.DELIVERED.name(), order.getStatus());
        assertNotNull(assignment.getDeliveredAt());
        verify(deliveryAssignmentRepository).save(assignment);
        verify(orderRepository).save(order);
    }

    @Test
    void updateLocation_NewLocation_ShouldCreate() {
        ShipperLocationUpdateRequest request = new ShipperLocationUpdateRequest(new BigDecimal("10.0"),
                new BigDecimal("20.0"), true);
        when(shipperLocationRepository.findByShipperId(shipperId)).thenReturn(Optional.empty());
        when(userRepository.findById(shipperId)).thenReturn(Optional.of(shipper));

        deliveryService.updateLocation(shipperId, request);

        verify(shipperLocationRepository).save(any(ShipperLocation.class));
    }

    @Test
    void updateLocation_ExistingLocation_ShouldUpdate() {
        ShipperLocation existingLocation = new ShipperLocation();
        existingLocation.setShipper(shipper);
        ShipperLocationUpdateRequest request = new ShipperLocationUpdateRequest(new BigDecimal("11.0"),
                new BigDecimal("21.0"), false);

        when(shipperLocationRepository.findByShipperId(shipperId)).thenReturn(Optional.of(existingLocation));

        deliveryService.updateLocation(shipperId, request);

        assertEquals(new BigDecimal("11.0"), existingLocation.getLatitude());
        assertFalse(existingLocation.getIsOnline());
        verify(shipperLocationRepository).save(existingLocation);
    }
}
