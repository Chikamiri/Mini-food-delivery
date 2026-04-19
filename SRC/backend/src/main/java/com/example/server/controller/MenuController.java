package com.example.server.controller;

import com.example.server.dto.restaurant.MenuCategoryResponse;
import com.example.server.dto.restaurant.MenuItemRequest;
import com.example.server.dto.restaurant.MenuItemResponse;
import com.example.server.service.MenuService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
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
    public ResponseEntity<MenuCategoryResponse> addMenuCategory(@PathVariable Long restaurantId, @RequestBody String name) {
        return ResponseEntity.status(HttpStatus.CREATED).body(menuService.addMenuCategory(restaurantId, name));
    }

    @PutMapping("/categories/{categoryId}")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<MenuCategoryResponse> updateMenuCategory(@PathVariable Long restaurantId,
                                                                   @PathVariable Long categoryId,
                                                                   @RequestBody String name) {
        return ResponseEntity.ok(menuService.updateMenuCategory(categoryId, name));
    }

    @DeleteMapping("/categories/{categoryId}")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<Void> deleteMenuCategory(@PathVariable Long restaurantId, @PathVariable Long categoryId) {
        menuService.deleteMenuCategory(categoryId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/categories/{categoryId}/items")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<MenuItemResponse> addMenuItem(@PathVariable Long restaurantId,
                                                        @PathVariable Long categoryId,
                                                        @Valid @RequestBody MenuItemRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(menuService.addMenuItem(restaurantId, categoryId, request));
    }

    @PutMapping("/items/{itemId}")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<MenuItemResponse> updateMenuItem(@PathVariable Long restaurantId,
                                                           @PathVariable Long itemId,
                                                           @Valid @RequestBody MenuItemRequest request) {
        return ResponseEntity.ok(menuService.updateMenuItem(itemId, request));
    }

    @DeleteMapping("/items/{itemId}")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<Void> deleteMenuItem(@PathVariable Long restaurantId, @PathVariable Long itemId) {
        menuService.deleteMenuItem(itemId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/items/{itemId}")
    public ResponseEntity<MenuItemResponse> getMenuItem(@PathVariable Long restaurantId, @PathVariable Long itemId) {
        return ResponseEntity.ok(menuService.getMenuItem(itemId));
    }
}
