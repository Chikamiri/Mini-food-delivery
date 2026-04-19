package com.example.server.service.impl;

import com.example.server.dto.common.PageResponse;
import com.example.server.dto.restaurant.*;
import com.example.server.entity.Restaurant;
import com.example.server.exception.ResourceNotFoundException;
import com.example.server.mapper.RestaurantMapper;
import com.example.server.repository.RestaurantRepository;
import com.example.server.service.RestaurantService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RestaurantServiceImpl implements RestaurantService {

    private static final String RESOURCE_NAME = "Restaurant";

    private final RestaurantRepository restaurantRepository;
    private final RestaurantMapper restaurantMapper;

    @Override
    public PageResponse<RestaurantCardResponse> searchRestaurants(RestaurantSearchRequest request) {
        String sortBy = request.getSortBy() != null ? request.getSortBy() : "id";
        String sortDir = request.getSortDir() != null ? request.getSortDir() : "ASC";
        
        Pageable pageable = PageRequest.of(
                request.getPage(),
                request.getSize(),
                Sort.by(Sort.Direction.fromString(sortDir), sortBy)
        );

        Page<Restaurant> restaurantPage = restaurantRepository.searchRestaurants(
                request.getKeyword(),
                request.getCategoryId(),
                pageable
        );

        return PageResponse.<RestaurantCardResponse>builder()
                .items(restaurantPage.getContent().stream()
                        .map(restaurantMapper::toCardResponse)
                        .collect(Collectors.toList()))
                .page(restaurantPage.getNumber())
                .size(restaurantPage.getSize())
                .totalElements(restaurantPage.getTotalElements())
                .totalPages(restaurantPage.getTotalPages())
                .last(restaurantPage.isLast())
                .build();
    }

    @Override
    public RestaurantDetailResponse getRestaurantDetail(Long id) {
        Restaurant restaurant = restaurantRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(RESOURCE_NAME, "id", id));
        return restaurantMapper.toDetailResponse(restaurant);
    }

    @Override
    @Transactional
    public void approveRestaurant(Long id, RestaurantApprovalRequest request) {
        Restaurant restaurant = restaurantRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(RESOURCE_NAME, "id", id));
        
        restaurant.setIsApproved(request.getApproved());
        // note is ignored for now as there is no field in entity
        restaurantRepository.save(restaurant);
    }

    @Override
    public List<RestaurantCardResponse> getMyRestaurants(Long ownerId) {
        return restaurantRepository.findByOwnerId(ownerId).stream()
                .map(restaurantMapper::toCardResponse)
                .collect(Collectors.toList());
    }
}
