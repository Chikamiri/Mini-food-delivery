package com.example.server.controller;

import com.example.server.dto.delivery.ShipperLocationDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
@Slf4j
public class LocationWebSocketController {

    private final SimpMessagingTemplate messagingTemplate;

    /**
     * Shippers send updates to: /app/shipper/location
     * Clients (Customers/Admins) subscribe to: /topic/order/{orderId}
     */
    @MessageMapping("/shipper/location")
    public void handleShipperLocation(@Payload ShipperLocationDTO locationDTO) {
        log.debug("Received location update for order {}: lat={}, lng={}", 
                locationDTO.getOrderId(), locationDTO.getLatitude(), locationDTO.getLongitude());
        
        // Broadcast the location update to subscribers of this specific order
        String destination = "/topic/order/" + locationDTO.getOrderId();
        messagingTemplate.convertAndSend(destination, locationDTO);
    }
}
