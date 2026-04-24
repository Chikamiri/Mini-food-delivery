package com.example.server.controller;

import com.example.server.dto.owner.OwnerRequestApproval;
import com.example.server.dto.owner.OwnerRequestResponse;
import com.example.server.dto.owner.OwnerRequestSubmission;
import com.example.server.security.CustomUserDetails;
import com.example.server.service.OwnerRequestService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/owner-requests")
@RequiredArgsConstructor
public class OwnerRequestController {

    private final OwnerRequestService ownerRequestService;

    @PostMapping
    public ResponseEntity<OwnerRequestResponse> submitRequest(@AuthenticationPrincipal CustomUserDetails userDetails,
                                                             @Valid @RequestBody OwnerRequestSubmission request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ownerRequestService.submitRequest(userDetails.getId(), request));
    }

    @GetMapping("/my")
    public ResponseEntity<List<OwnerRequestResponse>> getMyRequests(@AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(ownerRequestService.getUserRequests(userDetails.getId()));
    }

    @GetMapping("/pending")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<OwnerRequestResponse>> getPendingRequests() {
        return ResponseEntity.ok(ownerRequestService.getAllPendingRequests());
    }

    @PutMapping("/{id}/process")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<OwnerRequestResponse> processRequest(@PathVariable Long id,
                                                              @RequestBody OwnerRequestApproval approval) {
        return ResponseEntity.ok(ownerRequestService.processRequest(id, approval));
    }
}
