package com.example.server.service.impl;

import com.example.server.dto.report.AdminStatsResponse;
import com.example.server.dto.restaurant.RestaurantApprovalRequest;
import com.example.server.dto.restaurant.RestaurantCardResponse;
import com.example.server.dto.user.UserProfileResponse;
import com.example.server.dto.user.UserRoleUpdateRequest;
import com.example.server.dto.user.UserStatusUpdateRequest;
import com.example.server.entity.Restaurant;
import com.example.server.exception.ResourceNotFoundException;
import com.example.server.mapper.RestaurantMapper;
import com.example.server.mapper.UserMapper;
import com.example.server.repository.OrderRepository;
import com.example.server.repository.RestaurantRepository;
import com.example.server.repository.UserRepository;
import com.example.server.service.AdminService;
import com.example.server.service.NotificationService;
import com.example.server.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminServiceImpl implements AdminService {

    private static final String RESOURCE_NAME = "Restaurant";

    private final RestaurantRepository restaurantRepository;
    private final UserRepository userRepository;
    private final OrderRepository orderRepository;
    private final UserService userService;
    private final NotificationService notificationService;
    private final UserMapper userMapper;
    private final RestaurantMapper restaurantMapper;

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

    @Override
    public List<UserProfileResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(userMapper::toProfileResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<RestaurantCardResponse> getPendingRestaurants() {
        return restaurantRepository.findByIsApprovedFalseAndIsDeletedFalse().stream()
                .map(restaurantMapper::toCardResponse)
                .collect(Collectors.toList());
    }

    @Override
    public AdminStatsResponse getSystemStats() {
        long totalUsers = userRepository.count();
        long totalRestaurants = restaurantRepository.count();
        long pendingRestaurants = restaurantRepository.findByIsApprovedFalseAndIsDeletedFalse().size();
        long totalOrders = orderRepository.count();
        
        // Revenue for all time (simplified)
        java.math.BigDecimal totalRevenue = orderRepository.sumTotalRevenue(
                LocalDateTime.of(2000, 1, 1, 0, 0), 
                LocalDateTime.now()
        );

        return AdminStatsResponse.builder()
                .totalUsers(totalUsers)
                .totalRestaurants(totalRestaurants)
                .pendingRestaurants(pendingRestaurants)
                .totalOrders(totalOrders)
                .totalRevenue(totalRevenue != null ? totalRevenue.doubleValue() : 0.0)
                .build();
    }
}
