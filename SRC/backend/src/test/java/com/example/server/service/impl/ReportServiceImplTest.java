package com.example.server.service.impl;

import com.example.server.dto.report.AdminReportSummaryResponse;
import com.example.server.repository.OrderRepository;
import com.example.server.repository.RestaurantRepository;
import com.example.server.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ReportServiceImplTest {

    @Mock
    private OrderRepository orderRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private RestaurantRepository restaurantRepository;

    @InjectMocks
    private ReportServiceImpl reportService;

    @Test
    void getAdminReport_ShouldAggregateDataCorrectly() {
        LocalDate start = LocalDate.of(2023, 1, 1);
        LocalDate end = LocalDate.of(2023, 1, 31);

        when(orderRepository.sumTotalRevenue(any(LocalDateTime.class), any(LocalDateTime.class)))
                .thenReturn(new BigDecimal("1000.00"));
        when(orderRepository.countDeliveredOrders(any(LocalDateTime.class), any(LocalDateTime.class)))
                .thenReturn(50L);
        when(userRepository.countByActiveTrue()).thenReturn(100L);
        when(restaurantRepository.countByIsApprovedTrue()).thenReturn(10L);

        AdminReportSummaryResponse result = reportService.getAdminReport(start, end);

        assertNotNull(result);
        assertEquals(new BigDecimal("1000.00"), result.getTotalRevenue());
        assertEquals(50L, result.getDeliveredOrderCount());
        assertEquals(100L, result.getActiveUserCount());
        assertEquals(10L, result.getApprovedRestaurantCount());
        assertEquals(start, result.getStartDate());
        assertEquals(end, result.getEndDate());
    }

    @Test
    void getAdminReport_NullRevenue_ShouldReturnZero() {
        LocalDate start = LocalDate.now();
        LocalDate end = LocalDate.now();

        when(orderRepository.sumTotalRevenue(any(LocalDateTime.class), any(LocalDateTime.class)))
                .thenReturn(null);
        when(orderRepository.countDeliveredOrders(any(LocalDateTime.class), any(LocalDateTime.class)))
                .thenReturn(0L);
        when(userRepository.countByActiveTrue()).thenReturn(0L);
        when(restaurantRepository.countByIsApprovedTrue()).thenReturn(0L);

        AdminReportSummaryResponse result = reportService.getAdminReport(start, end);

        assertEquals(BigDecimal.ZERO, result.getTotalRevenue());
    }
}
