package com.example.server.dto.delivery;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ShipperLocationResponse {
    private Long id;
    private Long shipperId;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private Boolean isOnline;
    private LocalDateTime updatedAt;
}
