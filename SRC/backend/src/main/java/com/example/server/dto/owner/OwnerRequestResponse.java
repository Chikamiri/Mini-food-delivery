package com.example.server.dto.owner;

import com.example.server.enums.OwnerRequestStatus;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class OwnerRequestResponse {
    private Long id;
    private Long userId;
    private String userEmail;
    private String restaurantName;
    private String restaurantAddress;
    private String restaurantPhone;
    private String description;
    private OwnerRequestStatus status;
    private String adminNote;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
