package com.example.server.controller;

import com.example.server.dto.delivery.ShipperLocationDTO;
import com.example.server.entity.ShipperLocation;
import com.example.server.entity.User;
import com.example.server.repository.ShipperLocationRepository;
import com.example.server.repository.UserRepository;
import com.example.server.security.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Controller;
import org.springframework.transaction.annotation.Transactional;

import java.security.Principal;

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
    public void handleShipperLocation(@Payload ShipperLocationDTO locationDTO, Principal principal) {
        if (principal == null) {
            log.warn("Unauthorized location update attempt (no principal)");
            return;
        }

        CustomUserDetails userDetails = (CustomUserDetails) ((UsernamePasswordAuthenticationToken) principal).getPrincipal();
        Long authenticatedUserId = userDetails.getId();

        // 1. Security Check: Ensure the authenticated user is the shipper being updated
        if (!authenticatedUserId.equals(locationDTO.getShipperId())) {
            log.warn("Security alert: User {} tried to update location for shipper {}", 
                    authenticatedUserId, locationDTO.getShipperId());
            return;
        }

        log.debug("Received location update for order {}: lat={}, lng={}", 
                locationDTO.getOrderId(), locationDTO.getLatitude(), locationDTO.getLongitude());
        
        // 2. Persist the location to DB
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

        // 3. Broadcast to subscribers
        String destination = "/topic/order/" + locationDTO.getOrderId();
        messagingTemplate.convertAndSend(destination, locationDTO);
    }
}
