package com.example.server.listener;

import com.example.server.event.OrderReadyEvent;
import com.example.server.service.DeliveryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class OrderEventListener {

    private final DeliveryService deliveryService;

    @EventListener
    public void handleOrderReadyEvent(OrderReadyEvent event) {
        log.info("Order {} is ready. Creating delivery assignment.", event.getOrderId());
        try {
            deliveryService.createUnassignedAssignment(event.getOrderId());
        } catch (Exception e) {
            log.error("Failed to create delivery assignment for order {}: {}", event.getOrderId(), e.getMessage());
        }
    }
}
