package com.example.server.mapper;

import com.example.server.dto.order.*;
import com.example.server.entity.Order;
import com.example.server.entity.OrderItem;
import com.example.server.entity.OrderStatusHistory;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", uses = {DeliveryMapper.class})
public interface OrderMapper {
    @Mapping(target = "userId", source = "user.id")
    @Mapping(target = "restaurantId", source = "restaurant.id")
    @Mapping(target = "restaurantName", source = "restaurant.name")
    OrderSummaryResponse toSummaryResponse(Order order);

    @Mapping(target = "menuItemId", source = "menuItem.id")
    @Mapping(target = "itemName", source = "menuItem.name")
    @Mapping(target = "itemPrice", source = "menuItem.price")
    OrderItemResponse toItemResponse(OrderItem orderItem);

    @Mapping(target = "orderId", source = "id")
    @Mapping(target = "timeline", source = "statusHistories")
    @Mapping(target = "assignment", source = "deliveryAssignment")
    OrderTrackingResponse toTrackingResponse(Order order);

    @Mapping(target = "orderId", source = "order.id")
    @Mapping(target = "changedByUserId", source = "changedBy.id")
    @Mapping(target = "changedByName", source = "changedBy.fullName")
    OrderStatusHistoryResponse toStatusHistoryResponse(OrderStatusHistory history);
}
