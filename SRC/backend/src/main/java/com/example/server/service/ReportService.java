package com.example.server.service;

import com.example.server.dto.report.AdminReportSummaryResponse;
import java.time.LocalDate;

public interface ReportService {
    AdminReportSummaryResponse getAdminReport(LocalDate startDate, LocalDate endDate);
}
