package com.example.server.listener;

import com.example.server.event.OrderReadyEvent;
import com.example.server.service.DeliveryService;
import com.example.server.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.event.TransactionalEventListener;
import org.springframework.transaction.event.TransactionPhase;

@Component
@RequiredArgsConstructor
@Slf4j
public class OrderEventListener {

    private final DeliveryService deliveryService;
    private final NotificationService notificationService;

    // Run AFTER the main transaction commits so it doesn't poison the outer transaction.
    // REQUIRES_NEW ensures a fresh transaction for saving the delivery assignment.
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void handleOrderReadyEvent(OrderReadyEvent event) {
        log.info("Order {} is ready. Creating delivery assignment.", event.getOrderId());
        try {
            deliveryService.createUnassignedAssignment(event.getOrderId());
        } catch (Exception e) {
            log.error("Failed to create delivery assignment for order {}: {}", event.getOrderId(), e.getMessage());
            try {
                notificationService.createNotification(
                        1L,
                        "Delivery Assignment Failed",
                        "Failed to create delivery assignment for order #" + event.getOrderId() + ". Manual intervention may be required.",
                        "SYSTEM_ERROR"
                );
            } catch (Exception notifyEx) {
                log.error("Also failed to send notification: {}", notifyEx.getMessage());
            }
        }
    }
}
