package com.example.server.service;

import com.example.server.dto.common.PageResponse;
import com.example.server.dto.restaurant.*;
import java.util.List;

public interface RestaurantService {
    PageResponse<RestaurantCardResponse> searchRestaurants(RestaurantSearchRequest request);
    RestaurantDetailResponse getRestaurantDetail(Long id);
    void approveRestaurant(Long id, RestaurantApprovalRequest request);
    List<RestaurantCardResponse> getMyRestaurants(Long ownerId);
    // Add more as needed
}
