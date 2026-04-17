package com.example.server.service.impl;

import com.example.server.dto.report.AdminReportSummaryResponse;
import com.example.server.repository.OrderRepository;
import com.example.server.repository.RestaurantRepository;
import com.example.server.repository.UserRepository;
import com.example.server.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Service
@RequiredArgsConstructor
public class ReportServiceImpl implements ReportService {

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final RestaurantRepository restaurantRepository;

    @Override
    public AdminReportSummaryResponse getAdminReport(LocalDate startDate, LocalDate endDate) {
        LocalDateTime start = startDate.atStartOfDay();
        LocalDateTime end = endDate.atTime(LocalTime.MAX);

        BigDecimal totalRevenue = orderRepository.sumTotalRevenue(start, end);
        if (totalRevenue == null) {
            totalRevenue = BigDecimal.ZERO;
        }

        Long deliveredOrderCount = orderRepository.countDeliveredOrders(start, end);
        Long activeUserCount = userRepository.countByActiveTrue();
        Long approvedRestaurantCount = restaurantRepository.countByIsApprovedTrue();

        return AdminReportSummaryResponse.builder()
                .startDate(startDate)
                .endDate(endDate)
                .totalRevenue(totalRevenue)
                .deliveredOrderCount(deliveredOrderCount)
                .activeUserCount(activeUserCount)
                .approvedRestaurantCount(approvedRestaurantCount)
                .build();
    }
}
