package com.example.server.dto.shipper;

import com.example.server.enums.ShipperRequestStatus;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class ShipperRequestResponse {
    private Long id;
    private Long userId;
    private String userEmail;
    private String phoneNumber;
    private String licensePlate;
    private ShipperRequestStatus status;
    private String adminNote;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
