package com.example.server.service;

import com.example.server.dto.report.AdminReportSummaryResponse;
import com.example.server.dto.report.RestaurantRevenueResponse;
import java.time.LocalDate;
import java.util.List;

public interface ReportService {
    AdminReportSummaryResponse getAdminReport(LocalDate startDate, LocalDate endDate);
    List<RestaurantRevenueResponse> getRestaurantRevenue(LocalDate startDate, LocalDate endDate);
    byte[] generateRevenueCsv(LocalDate startDate, LocalDate endDate);
}
