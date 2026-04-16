package com.example.server.service;

import com.example.server.dto.delivery.*;

public interface DeliveryService {
    DeliveryAssignmentResponse assignShipper(AssignShipperRequest request);
    void markPickedUp(Long shipperId, Long orderId, MarkPickupRequest request);
    void markDelivered(Long shipperId, Long orderId, MarkDeliveredRequest request);
    void updateLocation(Long shipperId, ShipperLocationUpdateRequest request);
    ShipperLocationResponse getShipperLocation(Long shipperId);
}
