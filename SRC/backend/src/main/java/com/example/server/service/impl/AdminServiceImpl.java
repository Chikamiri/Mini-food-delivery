package com.example.server.service.impl;

import com.example.server.dto.restaurant.RestaurantApprovalRequest;
import com.example.server.dto.user.UserRoleUpdateRequest;
import com.example.server.dto.user.UserStatusUpdateRequest;
import com.example.server.entity.Restaurant;
import com.example.server.exception.ResourceNotFoundException;
import com.example.server.repository.RestaurantRepository;
import com.example.server.service.AdminService;
import com.example.server.service.NotificationService;
import com.example.server.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AdminServiceImpl implements AdminService {

    private static final String RESOURCE_NAME = "Restaurant";

    private final RestaurantRepository restaurantRepository;
    private final UserService userService;
    private final NotificationService notificationService;

    @Override
    @Transactional
    public void approveRestaurant(Long restaurantId, RestaurantApprovalRequest request) {
        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new ResourceNotFoundException(RESOURCE_NAME, "id", restaurantId));

        restaurant.setIsApproved(request.getApproved());
        restaurantRepository.save(restaurant);

        String status = request.getApproved() ? "approved" : "rejected";
        String message = "Your restaurant '" + restaurant.getName() + "' has been " + status + ".";
        if (request.getNote() != null && !request.getNote().isBlank()) {
            message += " Note: " + request.getNote();
        }

        notificationService.createNotification(
                restaurant.getOwner().getId(),
                "Restaurant Approval Update",
                message,
                "SYSTEM"
        );
    }

    @Override
    @Transactional
    public void updateUserRole(Long userId, UserRoleUpdateRequest request) {
        userService.updateUserRole(userId, request);
    }

    @Override
    @Transactional
    public void updateUserStatus(Long userId, UserStatusUpdateRequest request) {
        userService.updateUserStatus(userId, request);
    }
}
