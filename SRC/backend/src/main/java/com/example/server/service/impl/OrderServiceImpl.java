package com.example.server.service.impl;

import com.example.server.dto.common.PageResponse;
import com.example.server.dto.order.*;
import com.example.server.entity.*;
import com.example.server.enums.OrderStatus;
import com.example.server.event.OrderReadyEvent;
import com.example.server.exception.AppException;
import com.example.server.exception.ResourceNotFoundException;
import com.example.server.mapper.OrderMapper;
import com.example.server.repository.*;
import com.example.server.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

    private static final String RESOURCE_NAME = "Order";

    private final OrderRepository orderRepository;
    private final OrderStatusHistoryRepository orderStatusHistoryRepository;
    private final UserRepository userRepository;
    private final RestaurantRepository restaurantRepository;
    private final MenuItemRepository menuItemRepository;
    private final OrderMapper orderMapper;
    private final ApplicationEventPublisher eventPublisher;

    @Override
    @Transactional
    public OrderSummaryResponse createOrder(Long userId, CreateOrderRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        Restaurant restaurant = restaurantRepository.findById(request.getRestaurantId())
                .orElseThrow(() -> new ResourceNotFoundException("Restaurant", "id", request.getRestaurantId()));

        Order order = new Order();
        order.setUser(user);
        order.setRestaurant(restaurant);
        order.setDeliveryAddress(request.getDeliveryAddress());
        order.setDeliveryLat(request.getDeliveryLat());
        order.setDeliveryLng(request.getDeliveryLng());
        order.setPaymentMethod(request.getPaymentMethod());
        order.setNote(request.getNote());
        order.setStatus(OrderStatus.PENDING.name());
        order.setDeliveryFee(new BigDecimal("15.00")); // Mock delivery fee

        BigDecimal subtotal = BigDecimal.ZERO;
        List<OrderItem> items = request.getItems().stream().map(itemRequest -> {
            MenuItem menuItem = menuItemRepository.findById(itemRequest.getMenuItemId())
                    .orElseThrow(() -> new ResourceNotFoundException("MenuItem", "id", itemRequest.getMenuItemId()));

            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setMenuItem(menuItem);
            orderItem.setItemName(menuItem.getName());
            orderItem.setItemPrice(menuItem.getPrice());
            orderItem.setQuantity(itemRequest.getQuantity());
            orderItem.setSubtotal(menuItem.getPrice().multiply(BigDecimal.valueOf(itemRequest.getQuantity())));
            orderItem.setNote(itemRequest.getNote());
            return orderItem;
        }).toList();

        for (OrderItem item : items) {
            subtotal = subtotal.add(item.getSubtotal());
        }

        order.setSubtotal(subtotal);
        order.setTotalAmount(subtotal.add(order.getDeliveryFee()));
        order.setOrderItems(items);

        Order savedOrder = orderRepository.save(order);

        // Add initial status history
        addStatusHistory(savedOrder, user, OrderStatus.PENDING.name(), "Order created");

        return orderMapper.toSummaryResponse(savedOrder);
    }

    @Override
    public OrderSummaryResponse getOrderSummary(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(RESOURCE_NAME, "id", id));
        return orderMapper.toSummaryResponse(order);
    }

    @Override
    public PageResponse<OrderSummaryResponse> getOrderHistory(Long userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Order> orderPage = orderRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);

        return PageResponse.<OrderSummaryResponse>builder()
                .items(orderPage.getContent().stream()
                        .map(orderMapper::toSummaryResponse)
                        .collect(Collectors.toList()))
                .page(orderPage.getNumber())
                .size(orderPage.getSize())
                .totalElements(orderPage.getTotalElements())
                .totalPages(orderPage.getTotalPages())
                .last(orderPage.isLast())
                .build();
    }

    @Override
    @Transactional
    public void updateOrderStatus(Long orderId, Long userId, OrderStatusUpdateRequest request) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException(RESOURCE_NAME, "id", orderId));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        String oldStatus = order.getStatus();
        String newStatus = request.getStatus();

        validateStateTransition(oldStatus, newStatus);

        order.setStatus(newStatus);
        orderRepository.save(order);

        addStatusHistory(order, user, newStatus, request.getNote());

        // Publish event if ready for delivery
        if (OrderStatus.READY.name().equals(newStatus)) {
            eventPublisher.publishEvent(new OrderReadyEvent(this, order.getId()));
        }
    }

    private void validateStateTransition(String oldStatus, String newStatus) {
        OrderStatus current = OrderStatus.valueOf(oldStatus);
        OrderStatus next = OrderStatus.valueOf(newStatus);

        if (next == OrderStatus.CANCELLED || next == OrderStatus.REJECTED) {
            if (current == OrderStatus.SHIPPING || current == OrderStatus.DELIVERED) {
                throw new AppException(HttpStatus.BAD_REQUEST,
                        "Cannot cancel/reject an order that is already shipping or delivered", "INVALID_TRANSITION");
            }
            return;
        }

        boolean valid = switch (current) {
            case PENDING -> next == OrderStatus.CONFIRMED;
            case CONFIRMED -> next == OrderStatus.PREPARING;
            case PREPARING -> next == OrderStatus.READY;
            case READY -> next == OrderStatus.SHIPPING;
            case SHIPPING -> next == OrderStatus.DELIVERED;
            default -> false;
        };

        if (!valid) {
            throw new AppException(HttpStatus.BAD_REQUEST,
                    "Invalid order status transition from " + oldStatus + " to " + newStatus, "INVALID_TRANSITION");
        }
    }

    @Override
    public OrderTrackingResponse getOrderTracking(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException(RESOURCE_NAME, "id", orderId));
        return orderMapper.toTrackingResponse(order);
    }

    @Override
    public List<OrderSummaryResponse> getRestaurantOrders(Long restaurantId, String status) {
        return orderRepository.findByRestaurantIdAndStatus(restaurantId, status).stream()
                .map(orderMapper::toSummaryResponse)
                .collect(Collectors.toList());
    }

    private void addStatusHistory(Order order, User user, String status, String note) {
        OrderStatusHistory history = new OrderStatusHistory();
        history.setOrder(order);
        history.setChangedBy(user);
        history.setStatus(status);
        history.setNote(note);
        orderStatusHistoryRepository.save(history);
    }
}
