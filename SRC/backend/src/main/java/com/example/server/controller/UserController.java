package com.example.server.controller;

import com.example.server.dto.notification.MarkAllNotificationsReadRequest;
import com.example.server.dto.notification.MarkNotificationReadRequest;
import com.example.server.dto.notification.NotificationResponse;
import com.example.server.dto.user.AddressRequest;
import com.example.server.dto.user.AddressResponse;
import com.example.server.dto.user.UserProfileResponse;
import com.example.server.security.CustomUserDetails;
import com.example.server.service.NotificationService;
import com.example.server.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final NotificationService notificationService;

    @GetMapping("/me")
    public ResponseEntity<UserProfileResponse> getMyProfile(@AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(userService.getUserProfile(userDetails.getId()));
    }

    @PutMapping("/me")
    public ResponseEntity<UserProfileResponse> updateMyProfile(@AuthenticationPrincipal CustomUserDetails userDetails,
                                                              @Valid @RequestBody UserProfileResponse request) {
        return ResponseEntity.ok(userService.updateUserProfile(userDetails.getId(), request));
    }

    @GetMapping("/me/addresses")
    public ResponseEntity<List<AddressResponse>> getMyAddresses(@AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(userService.getUserAddresses(userDetails.getId()));
    }

    @PostMapping("/me/addresses")
    public ResponseEntity<AddressResponse> addAddress(@AuthenticationPrincipal CustomUserDetails userDetails,
                                                     @Valid @RequestBody AddressRequest request) {
        return ResponseEntity.ok(userService.addAddress(userDetails.getId(), request));
    }

    @PutMapping("/me/addresses/{id}")
    public ResponseEntity<AddressResponse> updateAddress(@AuthenticationPrincipal CustomUserDetails userDetails,
                                                        @PathVariable Long id,
                                                        @Valid @RequestBody AddressRequest request) {
        return ResponseEntity.ok(userService.updateAddress(userDetails.getId(), id, request));
    }

    @DeleteMapping("/me/addresses/{id}")
    public ResponseEntity<Void> deleteAddress(@AuthenticationPrincipal CustomUserDetails userDetails,
                                             @PathVariable Long id) {
        userService.deleteAddress(userDetails.getId(), id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/me/addresses/{id}/default")
    public ResponseEntity<Void> setDefaultAddress(@AuthenticationPrincipal CustomUserDetails userDetails,
                                                 @PathVariable Long id) {
        userService.setDefaultAddress(userDetails.getId(), id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/me/notifications")
    public ResponseEntity<List<NotificationResponse>> getMyNotifications(@AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(notificationService.getUserNotifications(userDetails.getId()));
    }

    @PatchMapping("/me/notifications/read")
    public ResponseEntity<Void> markNotificationRead(@AuthenticationPrincipal CustomUserDetails userDetails,
                                                    @Valid @RequestBody MarkNotificationReadRequest request) {
        notificationService.markAsRead(userDetails.getId(), request);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/me/notifications/read-all")
    public ResponseEntity<Void> markAllNotificationsRead(@AuthenticationPrincipal CustomUserDetails userDetails,
                                                        @Valid @RequestBody MarkAllNotificationsReadRequest request) {
        notificationService.markAllAsRead(userDetails.getId(), request);
        return ResponseEntity.ok().build();
    }
}
