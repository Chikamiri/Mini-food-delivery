package com.example.server.service.impl;

import com.example.server.dto.order.CreateOrderItemRequest;
import com.example.server.dto.order.CreateOrderRequest;
import com.example.server.dto.order.OrderSummaryResponse;
import com.example.server.dto.order.OrderStatusUpdateRequest;
import com.example.server.entity.MenuItem;
import com.example.server.entity.Order;
import com.example.server.entity.Restaurant;
import com.example.server.entity.User;
import com.example.server.enums.OrderStatus;
import com.example.server.enums.Role;
import com.example.server.event.OrderReadyEvent;
import com.example.server.exception.AppException;
import com.example.server.mapper.OrderMapper;
import com.example.server.repository.*;
import com.example.server.service.MapService;
import com.example.server.service.NotificationService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OrderServiceImplTest {

    @Mock
    private OrderRepository orderRepository;
    @Mock
    private OrderStatusHistoryRepository orderStatusHistoryRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private RestaurantRepository restaurantRepository;
    @Mock
    private MenuItemRepository menuItemRepository;
    @Mock
    private OrderMapper orderMapper;
    @Mock
    private ApplicationEventPublisher eventPublisher;
    @Mock
    private MapService mapService;
    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private OrderServiceImpl orderService;

    @org.junit.jupiter.api.BeforeEach
    void setUp() {
        org.springframework.test.util.ReflectionTestUtils.setField(orderService, "defaultDeliveryFee", "15.00");
    }

    @Test
    void shouldCreateOrderSuccessfully() {
        // Arrange
        Long userId = 1L;
        User user = User.builder().id(userId).email("user@test.com").build();
        User owner = User.builder().id(3L).build();
        Restaurant restaurant = Restaurant.builder().id(1L).latitude(new BigDecimal("10.0"))
                .longitude(new BigDecimal("10.0")).owner(owner).build();
        MenuItem menuItem = MenuItem.builder().id(1L).name("Pizza").price(new BigDecimal("100.0")).build();

        CreateOrderRequest request = new CreateOrderRequest();
        request.setRestaurantId(1L);
        request.setDeliveryAddress("Address");
        request.setDeliveryLat(new BigDecimal("10.1"));
        request.setDeliveryLng(new BigDecimal("10.1"));
        request.setItems(List.of(new CreateOrderItemRequest(1L, 2, "Note")));

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(restaurantRepository.findById(1L)).thenReturn(Optional.of(restaurant));
        when(menuItemRepository.findById(1L)).thenReturn(Optional.of(menuItem));
        when(orderRepository.save(any(Order.class))).thenAnswer(i -> {
            Order o = i.getArgument(0);
            o.setId(100L); // Set ID so notification service has it
            return o;
        });
        when(orderMapper.toSummaryResponse(any(Order.class))).thenReturn(new OrderSummaryResponse());

        // Act
        OrderSummaryResponse result = orderService.createOrder(userId, request);

        // Assert
        assertNotNull(result);
        verify(orderRepository, times(1)).save(any(Order.class));
        verify(orderStatusHistoryRepository, times(1)).save(any());
        verify(notificationService).createNotification(eq(3L), anyString(), anyString(), anyString());
    }

    @Test
    void shouldUpdateOrderStatusFromPreparingToReadySuccessfully() {
        // Arrange
        Long orderId = 1L;
        Long userId = 2L; // Owner
        User owner = User.builder().id(userId).role(Role.ROLE_OWNER).build();
        User customer = User.builder().id(4L).build();
        Restaurant restaurant = Restaurant.builder().owner(owner).build();
        Order order = new Order();
        order.setId(orderId);
        order.setStatus(OrderStatus.PREPARING.name());
        order.setRestaurant(restaurant);
        order.setUser(customer);

        OrderStatusUpdateRequest request = new OrderStatusUpdateRequest(OrderStatus.READY.name(), "Ready!");

        when(orderRepository.findById(orderId)).thenReturn(Optional.of(order));
        when(userRepository.findById(userId)).thenReturn(Optional.of(owner));

        // Act
        orderService.updateOrderStatus(orderId, userId, request);

        // Assert
        assertEquals(OrderStatus.READY.name(), order.getStatus());
        verify(eventPublisher, times(1)).publishEvent(any(OrderReadyEvent.class));
        verify(notificationService).createNotification(eq(4L), anyString(), anyString(), anyString());
    }

    @Test
    void shouldThrowExceptionWhenUpdatingToInvalidOrderStatus() {
        // Arrange
        Long orderId = 1L;
        Long userId = 1L;
        User admin = User.builder().id(userId).role(Role.ROLE_ADMIN).build();
        Order order = new Order();
        order.setStatus(OrderStatus.PENDING.name());

        // PENDING to READY is invalid (must go through CONFIRMED -> PREPARING)
        OrderStatusUpdateRequest request = new OrderStatusUpdateRequest(OrderStatus.READY.name(), "Cheat!");

        when(orderRepository.findById(orderId)).thenReturn(Optional.of(order));
        when(userRepository.findById(userId)).thenReturn(Optional.of(admin));

        // Act & Assert
        assertThrows(AppException.class, () -> {
            orderService.updateOrderStatus(orderId, userId, request);
        });
    }

    @Test
    void shouldThrowExceptionWhenGettingOrderSummaryUnauthorized() {
        // Arrange
        Long orderId = 1L;
        Long userId = 99L; // Stranger
        User stranger = User.builder().id(userId).role(Role.ROLE_CUSTOMER).build();
        User customer = User.builder().id(1L).build();
        Order order = new Order();
        order.setUser(customer);
        order.setRestaurant(Restaurant.builder().owner(User.builder().id(2L).build()).build());

        when(orderRepository.findById(orderId)).thenReturn(Optional.of(order));
        when(userRepository.findById(userId)).thenReturn(Optional.of(stranger));

        // Act & Assert
        assertThrows(AppException.class, () -> {
            orderService.getOrderSummary(orderId, userId);
        });
    }
}
