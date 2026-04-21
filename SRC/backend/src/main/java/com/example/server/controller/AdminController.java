package com.example.server.controller;

import com.example.server.dto.report.AdminReportSummaryResponse;
import com.example.server.dto.restaurant.RestaurantApprovalRequest;
import com.example.server.dto.user.UserRoleUpdateRequest;
import com.example.server.dto.user.UserStatusUpdateRequest;
import com.example.server.exception.AppException;
import com.example.server.security.CustomUserDetails;
import com.example.server.service.AdminService;
import com.example.server.service.ReportService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
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
    public ResponseEntity<Void> approveRestaurant(@PathVariable Long id,
            @Valid @RequestBody RestaurantApprovalRequest request) {
        adminService.approveRestaurant(id, request);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/users/{id}/role")
    public ResponseEntity<Void> updateUserRole(@AuthenticationPrincipal CustomUserDetails adminDetails,
            @PathVariable Long id,
            @Valid @RequestBody UserRoleUpdateRequest request) {
        // Prevent self-demotion
        if (adminDetails.getId().equals(id)) {
            throw new AppException(HttpStatus.BAD_REQUEST,
                    "Admins cannot change their own roles", "SELF_DEMOTION_DENIED");
        }
        adminService.updateUserRole(id, request);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/users/{id}/status")
    public ResponseEntity<Void> updateUserStatus(@AuthenticationPrincipal CustomUserDetails adminDetails,
            @PathVariable Long id,
            @Valid @RequestBody UserStatusUpdateRequest request) {
        // Prevent self-deactivation
        if (adminDetails.getId().equals(id)) {
            throw new AppException(HttpStatus.BAD_REQUEST,
                    "Admins cannot change their own status", "SELF_DEACTIVATION_DENIED");
        }
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
