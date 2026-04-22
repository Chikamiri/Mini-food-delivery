package com.example.server.service;

import com.example.server.dto.report.AdminStatsResponse;
import com.example.server.dto.restaurant.RestaurantApprovalRequest;
import com.example.server.dto.restaurant.RestaurantCardResponse;
import com.example.server.dto.user.UserProfileResponse;
import com.example.server.dto.user.UserRoleUpdateRequest;
import com.example.server.dto.user.UserStatusUpdateRequest;
import java.util.List;

public interface AdminService {
    void approveRestaurant(Long restaurantId, RestaurantApprovalRequest request);
    void updateUserRole(Long userId, UserRoleUpdateRequest request);
    void updateUserStatus(Long userId, UserStatusUpdateRequest request);
    List<UserProfileResponse> getAllUsers();
    List<RestaurantCardResponse> getPendingRestaurants();
    AdminStatsResponse getSystemStats();
}
