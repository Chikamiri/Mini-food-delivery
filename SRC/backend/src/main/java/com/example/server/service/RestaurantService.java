package com.example.server.service;

import com.example.server.dto.common.PageResponse;
import com.example.server.dto.restaurant.*;
import java.util.List;

public interface RestaurantService {
    PageResponse<RestaurantCardResponse> searchRestaurants(RestaurantSearchRequest request);
    RestaurantDetailResponse getRestaurantDetail(Long id);
    void approveRestaurant(Long id, RestaurantApprovalRequest request);
    List<RestaurantCardResponse> getMyRestaurants(Long ownerId);
    RestaurantDetailResponse createRestaurant(Long ownerId, RestaurantRequest request);
    RestaurantDetailResponse updateRestaurant(Long ownerId, Long id, RestaurantRequest request);
    void deleteRestaurant(Long ownerId, Long id);
}
