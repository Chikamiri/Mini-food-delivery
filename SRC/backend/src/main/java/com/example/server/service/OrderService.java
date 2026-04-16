package com.example.server.service;

import com.example.server.dto.common.PageResponse;
import com.example.server.dto.order.*;
import java.util.List;

public interface OrderService {
    OrderSummaryResponse createOrder(Long userId, CreateOrderRequest request);
    OrderSummaryResponse getOrderSummary(Long id);
    PageResponse<OrderSummaryResponse> getOrderHistory(Long userId, int page, int size);
    void updateOrderStatus(Long orderId, Long userId, OrderStatusUpdateRequest request);
    OrderTrackingResponse getOrderTracking(Long orderId);
    List<OrderSummaryResponse> getRestaurantOrders(Long restaurantId, String status);
}
