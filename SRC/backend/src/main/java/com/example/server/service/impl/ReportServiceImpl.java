package com.example.server.service.impl;

import com.example.server.dto.report.AdminReportSummaryResponse;
import com.example.server.dto.report.RestaurantRevenueResponse;
import com.example.server.repository.OrderRepository;
import com.example.server.repository.RestaurantRepository;
import com.example.server.repository.UserRepository;
import com.example.server.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

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

    @Override
    public List<RestaurantRevenueResponse> getRestaurantRevenue(LocalDate startDate, LocalDate endDate) {
        LocalDateTime start = startDate.atStartOfDay();
        LocalDateTime end = endDate.atTime(LocalTime.MAX);

        List<Object[]> results = orderRepository.findRestaurantRevenue(start, end);
        return results.stream()
                .map(result -> RestaurantRevenueResponse.builder()
                        .restaurantId((Long) result[0])
                        .restaurantName((String) result[1])
                        .orderCount((Long) result[2])
                        .totalRevenue((BigDecimal) result[3])
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    public byte[] generateRevenueCsv(LocalDate startDate, LocalDate endDate) {
        List<RestaurantRevenueResponse> data = getRestaurantRevenue(startDate, endDate);
        
        StringBuilder csv = new StringBuilder();
        csv.append("Restaurant ID,Restaurant Name,Order Count,Total Revenue\n");
        
        for (RestaurantRevenueResponse row : data) {
            csv.append(row.getRestaurantId()).append(",")
               .append("\"").append(row.getRestaurantName().replace("\"", "\"\"")).append("\",")
               .append(row.getOrderCount()).append(",")
               .append(row.getTotalRevenue()).append("\n");
        }
        
        return csv.toString().getBytes(StandardCharsets.UTF_8);
    }
}
