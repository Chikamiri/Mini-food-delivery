package com.example.server.dto.delivery;

import lombok.*;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ShipperLocationDTO {
    private Long orderId;
    private Long shipperId;
    private BigDecimal latitude;
    private BigDecimal longitude;
}
