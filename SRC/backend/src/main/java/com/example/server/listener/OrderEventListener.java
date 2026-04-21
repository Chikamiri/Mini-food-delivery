package com.example.server.listener;

import com.example.server.event.OrderReadyEvent;
import com.example.server.service.DeliveryService;
import com.example.server.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class OrderEventListener {

    private final DeliveryService deliveryService;
    private final NotificationService notificationService;

    @EventListener
    public void handleOrderReadyEvent(OrderReadyEvent event) {
        log.info("Order {} is ready. Creating delivery assignment.", event.getOrderId());
        try {
            deliveryService.createUnassignedAssignment(event.getOrderId());
        } catch (Exception e) {
            log.error("Failed to create delivery assignment for order {}: {}", event.getOrderId(), e.getMessage());
            // Optionally notify admin or restaurant owner about the failure
            notificationService.createNotification(
                    1L, // Admin user ID - in a real app, this should be a configurable or dynamic ID
                    "Delivery Assignment Failed",
                    "Failed to create delivery assignment for order #" + event.getOrderId() + ". Manual intervention may be required.",
                    "SYSTEM_ERROR"
            );
        }
    }
}
