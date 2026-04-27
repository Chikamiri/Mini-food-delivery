package com.example.server.controller;

import com.example.server.dto.shipper.ShipperRequestApproval;
import com.example.server.dto.shipper.ShipperRequestResponse;
import com.example.server.dto.shipper.ShipperRequestSubmission;
import com.example.server.security.CustomUserDetails;
import com.example.server.service.ShipperRequestService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/shipper-requests")
@RequiredArgsConstructor
public class ShipperRequestController {

    private final ShipperRequestService shipperRequestService;

    @PostMapping
    public ResponseEntity<ShipperRequestResponse> submitRequest(@AuthenticationPrincipal CustomUserDetails userDetails,
                                                               @Valid @RequestBody ShipperRequestSubmission request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(shipperRequestService.submitRequest(userDetails.getId(), request));
    }

    @GetMapping("/my")
    public ResponseEntity<List<ShipperRequestResponse>> getMyRequests(@AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(shipperRequestService.getUserRequests(userDetails.getId()));
    }

    @GetMapping("/pending")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<ShipperRequestResponse>> getPendingRequests() {
        return ResponseEntity.ok(shipperRequestService.getAllPendingRequests());
    }

    @PutMapping("/{id}/process")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ShipperRequestResponse> processRequest(@PathVariable Long id,
                                                                @RequestBody ShipperRequestApproval approval) {
        return ResponseEntity.ok(shipperRequestService.processRequest(id, approval));
    }
}
