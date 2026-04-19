package com.example.server.controller;

import com.example.server.dto.report.AdminReportSummaryResponse;
import com.example.server.dto.restaurant.RestaurantApprovalRequest;
import com.example.server.dto.user.UserRoleUpdateRequest;
import com.example.server.dto.user.UserStatusUpdateRequest;
import com.example.server.security.CustomUserDetails;
import com.example.server.service.AdminService;
import com.example.server.service.ReportService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;
    private final ReportService reportService;

    @PostMapping("/restaurants/{id}/approve")
    public ResponseEntity<Void> approveRestaurant(@PathVariable Long id, @Valid @RequestBody RestaurantApprovalRequest request) {
        adminService.approveRestaurant(id, request);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/users/{id}/role")
    public ResponseEntity<Void> updateUserRole(@AuthenticationPrincipal CustomUserDetails adminDetails,
                                               @PathVariable Long id,
                                               @Valid @RequestBody UserRoleUpdateRequest request) {
        // Prevent self-demotion
        if (adminDetails.getId().equals(id)) {
            throw new RuntimeException("Admins cannot change their own roles");
        }
        adminService.updateUserRole(id, request);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/users/{id}/status")
    public ResponseEntity<Void> updateUserStatus(@PathVariable Long id, @Valid @RequestBody UserStatusUpdateRequest request) {
        adminService.updateUserStatus(id, request);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/reports/summary")
    public ResponseEntity<AdminReportSummaryResponse> getAdminReport(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok(reportService.getAdminReport(startDate, endDate));
    }
}
