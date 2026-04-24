package com.example.server.dto.report;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;

@Data
@Builder
public class RestaurantRevenueResponse {
    private Long restaurantId;
    private String restaurantName;
    private Long orderCount;
    private BigDecimal totalRevenue;
}
