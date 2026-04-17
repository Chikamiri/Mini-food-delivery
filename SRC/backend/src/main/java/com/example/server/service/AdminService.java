package com.example.server.service;

import com.example.server.dto.restaurant.RestaurantApprovalRequest;
import com.example.server.dto.user.UserRoleUpdateRequest;
import com.example.server.dto.user.UserStatusUpdateRequest;

public interface AdminService {
    void approveRestaurant(Long restaurantId, RestaurantApprovalRequest request);
    void updateUserRole(Long userId, UserRoleUpdateRequest request);
    void updateUserStatus(Long userId, UserStatusUpdateRequest request);
}
