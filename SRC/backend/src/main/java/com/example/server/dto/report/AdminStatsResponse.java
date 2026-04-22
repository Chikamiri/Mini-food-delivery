package com.example.server.dto.report;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminStatsResponse {
    private Long totalUsers;
    private Long totalRestaurants;
    private Long pendingRestaurants;
    private Long totalOrders;
    private Double totalRevenue;
}
