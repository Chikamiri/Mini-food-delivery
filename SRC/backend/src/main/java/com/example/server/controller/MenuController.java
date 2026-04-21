package com.example.server.controller;

import com.example.server.dto.restaurant.MenuCategoryRequest;
import com.example.server.dto.restaurant.MenuCategoryResponse;
import com.example.server.dto.restaurant.MenuItemRequest;
import com.example.server.dto.restaurant.MenuItemResponse;
import com.example.server.security.CustomUserDetails;
import com.example.server.service.MenuService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/restaurants/{restaurantId}/menu")
@RequiredArgsConstructor
public class MenuController {

    private final MenuService menuService;

    @GetMapping("/categories")
    public ResponseEntity<List<MenuCategoryResponse>> getMenuCategories(@PathVariable Long restaurantId) {
        return ResponseEntity.ok(menuService.getMenuCategories(restaurantId));
    }

    @PostMapping("/categories")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<MenuCategoryResponse> addMenuCategory(@AuthenticationPrincipal CustomUserDetails userDetails,
                                                               @PathVariable Long restaurantId,
                                                               @Valid @RequestBody MenuCategoryRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(menuService.addMenuCategory(userDetails.getId(), restaurantId, request));
    }

    @PutMapping("/categories/{categoryId}")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<MenuCategoryResponse> updateMenuCategory(@AuthenticationPrincipal CustomUserDetails userDetails,
                                                                   @PathVariable Long restaurantId,
                                                                   @PathVariable Long categoryId,
                                                                   @Valid @RequestBody MenuCategoryRequest request) {
        return ResponseEntity.ok(menuService.updateMenuCategory(userDetails.getId(), categoryId, request));
    }

    @DeleteMapping("/categories/{categoryId}")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<Void> deleteMenuCategory(@AuthenticationPrincipal CustomUserDetails userDetails,
                                                   @PathVariable Long restaurantId,
                                                   @PathVariable Long categoryId) {
        menuService.deleteMenuCategory(userDetails.getId(), categoryId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/categories/{categoryId}/items")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<MenuItemResponse> addMenuItem(@AuthenticationPrincipal CustomUserDetails userDetails,
                                                        @PathVariable Long restaurantId,
                                                        @PathVariable Long categoryId,
                                                        @Valid @RequestBody MenuItemRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(menuService.addMenuItem(userDetails.getId(), restaurantId, categoryId, request));
    }

    @PutMapping("/items/{itemId}")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<MenuItemResponse> updateMenuItem(@AuthenticationPrincipal CustomUserDetails userDetails,
                                                           @PathVariable Long restaurantId,
                                                           @PathVariable Long itemId,
                                                           @Valid @RequestBody MenuItemRequest request) {
        return ResponseEntity.ok(menuService.updateMenuItem(userDetails.getId(), itemId, request));
    }

    @DeleteMapping("/items/{itemId}")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<Void> deleteMenuItem(@AuthenticationPrincipal CustomUserDetails userDetails,
                                               @PathVariable Long restaurantId,
                                               @PathVariable Long itemId) {
        menuService.deleteMenuItem(userDetails.getId(), itemId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/items/{itemId}")
    public ResponseEntity<MenuItemResponse> getMenuItem(@PathVariable Long restaurantId, @PathVariable Long itemId) {
        return ResponseEntity.ok(menuService.getMenuItem(itemId));
    }
}
