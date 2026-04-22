package com.example.server.controller;

import com.example.server.dto.common.PageResponse;
import com.example.server.dto.restaurant.*;
import com.example.server.security.CustomUserDetails;
import com.example.server.service.RestaurantService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/restaurants")
@RequiredArgsConstructor
public class RestaurantController {

    private final RestaurantService restaurantService;

    @PostMapping("/search")
    public ResponseEntity<PageResponse<RestaurantCardResponse>> searchRestaurants(@Valid @RequestBody RestaurantSearchRequest request) {
        return ResponseEntity.ok(restaurantService.searchRestaurants(request));
    }

    @GetMapping("/{id}")
    public ResponseEntity<RestaurantDetailResponse> getRestaurantDetail(@PathVariable Long id) {
        return ResponseEntity.ok(restaurantService.getRestaurantDetail(id));
    }

    @GetMapping("/my-restaurants")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<List<RestaurantCardResponse>> getMyRestaurants(@AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(restaurantService.getMyRestaurants(userDetails.getId()));
    }

    @PostMapping
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<RestaurantDetailResponse> createRestaurant(@AuthenticationPrincipal CustomUserDetails userDetails,
                                                                    @Valid @RequestBody RestaurantRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(restaurantService.createRestaurant(userDetails.getId(), request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<RestaurantDetailResponse> updateRestaurant(@AuthenticationPrincipal CustomUserDetails userDetails,
                                                                    @PathVariable Long id,
                                                                    @Valid @RequestBody RestaurantRequest request) {
        return ResponseEntity.ok(restaurantService.updateRestaurant(userDetails.getId(), id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<Void> deleteRestaurant(@AuthenticationPrincipal CustomUserDetails userDetails,
                                                @PathVariable Long id) {
        restaurantService.deleteRestaurant(userDetails.getId(), id);
        return ResponseEntity.noContent().build();
    }
}
