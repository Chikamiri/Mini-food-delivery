package com.example.server.controller;

import com.example.server.dto.restaurant.RestaurantCategoryResponse;
import com.example.server.service.RestaurantService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/restaurant-categories")
@RequiredArgsConstructor
public class RestaurantCategoryController {

    private final RestaurantService restaurantService;

    @GetMapping
    public ResponseEntity<List<RestaurantCategoryResponse>> getAllCategories() {
        return ResponseEntity.ok(restaurantService.getAllCategories());
    }
}
