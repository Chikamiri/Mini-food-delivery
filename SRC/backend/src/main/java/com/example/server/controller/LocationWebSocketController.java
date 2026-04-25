package com.example.server.controller;

import com.example.server.dto.delivery.ShipperLocationDTO;
import com.example.server.entity.ShipperLocation;
import com.example.server.entity.User;
import com.example.server.repository.ShipperLocationRepository;
import com.example.server.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.transaction.annotation.Transactional;

@Controller
@RequiredArgsConstructor
@Slf4j
public class LocationWebSocketController {

    private final SimpMessagingTemplate messagingTemplate;
    private final ShipperLocationRepository shipperLocationRepository;
    private final UserRepository userRepository;

    /**
     * Shippers send updates to: /app/shipper/location
     * Clients (Customers/Admins) subscribe to: /topic/order/{orderId}
     */
    @MessageMapping("/shipper/location")
    @Transactional
    public void handleShipperLocation(@Payload ShipperLocationDTO locationDTO) {
        log.debug("Received location update for order {}: lat={}, lng={}", 
                locationDTO.getOrderId(), locationDTO.getLatitude(), locationDTO.getLongitude());
        
        // 1. Persist the location to DB
        if (locationDTO.getShipperId() != null) {
            ShipperLocation location = shipperLocationRepository.findByShipperId(locationDTO.getShipperId())
                    .orElseGet(() -> {
                        User shipper = userRepository.getReferenceById(locationDTO.getShipperId());
                        ShipperLocation newLoc = new ShipperLocation();
                        newLoc.setShipper(shipper);
                        return newLoc;
                    });
            
            location.setLatitude(locationDTO.getLatitude());
            location.setLongitude(locationDTO.getLongitude());
            location.setIsOnline(true);
            shipperLocationRepository.save(location);
        }

        // 2. Broadcast to subscribers
        String destination = "/topic/order/" + locationDTO.getOrderId();
        messagingTemplate.convertAndSend(destination, locationDTO);
    }
}
