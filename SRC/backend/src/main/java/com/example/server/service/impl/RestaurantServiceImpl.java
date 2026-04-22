package com.example.server.service.impl;

import com.example.server.dto.common.PageResponse;
import com.example.server.dto.restaurant.*;
import com.example.server.entity.Restaurant;
import com.example.server.entity.RestaurantCategory;
import com.example.server.entity.User;
import com.example.server.exception.AppException;
import com.example.server.exception.ResourceNotFoundException;
import com.example.server.mapper.RestaurantMapper;
import com.example.server.repository.RestaurantCategoryRepository;
import com.example.server.repository.RestaurantRepository;
import com.example.server.repository.UserRepository;
import com.example.server.service.RestaurantService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RestaurantServiceImpl implements RestaurantService {

    private static final String RESOURCE_NAME = "Restaurant";

    private final RestaurantRepository restaurantRepository;
    private final UserRepository userRepository;
    private final RestaurantCategoryRepository categoryRepository;
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

        // Assuming searchRestaurants in repository handles is_deleted=false
        Page<Restaurant> restaurantPage = restaurantRepository.searchRestaurants(
                request.getKeyword(),
                request.getCategoryId(),
                pageable
        );

        return PageResponse.<RestaurantCardResponse>builder()
                .items(restaurantPage.getContent().stream()
                        .filter(r -> Boolean.FALSE.equals(r.getIsDeleted()))
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
        
        if (Boolean.TRUE.equals(restaurant.getIsDeleted())) {
            throw new ResourceNotFoundException(RESOURCE_NAME, "id", id);
        }
        
        return restaurantMapper.toDetailResponse(restaurant);
    }

    @Override
    @Transactional
    public void approveRestaurant(Long id, RestaurantApprovalRequest request) {
        Restaurant restaurant = restaurantRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(RESOURCE_NAME, "id", id));
        
        restaurant.setIsApproved(request.getApproved());
        restaurantRepository.save(restaurant);
    }

    @Override
    public List<RestaurantCardResponse> getMyRestaurants(Long ownerId) {
        return restaurantRepository.findByOwnerId(ownerId).stream()
                .filter(r -> Boolean.FALSE.equals(r.getIsDeleted()))
                .map(restaurantMapper::toCardResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public RestaurantDetailResponse createRestaurant(Long ownerId, RestaurantRequest request) {
        User owner = userRepository.findById(ownerId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", ownerId));

        Restaurant restaurant = restaurantMapper.toEntity(request);
        restaurant.setOwner(owner);
        restaurant.setIsApproved(false); // New restaurants need approval
        restaurant.setIsDeleted(false);

        if (request.getCategoryId() != null) {
            RestaurantCategory category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("RestaurantCategory", "id", request.getCategoryId()));
            restaurant.setCategory(category);
        }

        return restaurantMapper.toDetailResponse(restaurantRepository.save(restaurant));
    }

    @Override
    @Transactional
    public RestaurantDetailResponse updateRestaurant(Long ownerId, Long id, RestaurantRequest request) {
        Restaurant restaurant = restaurantRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(RESOURCE_NAME, "id", id));

        if (!restaurant.getOwner().getId().equals(ownerId)) {
            throw new AppException(HttpStatus.FORBIDDEN, "You are not the owner of this restaurant", "UNAUTHORIZED_ACCESS");
        }

        restaurantMapper.updateEntity(restaurant, request);

        if (request.getCategoryId() != null) {
            RestaurantCategory category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("RestaurantCategory", "id", request.getCategoryId()));
            restaurant.setCategory(category);
        }

        return restaurantMapper.toDetailResponse(restaurantRepository.save(restaurant));
    }

    @Override
    @Transactional
    public void deleteRestaurant(Long ownerId, Long id) {
        Restaurant restaurant = restaurantRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(RESOURCE_NAME, "id", id));

        if (!restaurant.getOwner().getId().equals(ownerId)) {
            throw new AppException(HttpStatus.FORBIDDEN, "You are not the owner of this restaurant", "UNAUTHORIZED_ACCESS");
        }

        restaurant.setIsDeleted(true);
        restaurantRepository.save(restaurant);
    }
}
