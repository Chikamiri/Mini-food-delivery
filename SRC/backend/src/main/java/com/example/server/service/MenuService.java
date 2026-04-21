package com.example.server.service;

import com.example.server.dto.restaurant.*;
import java.util.List;

public interface MenuService {
    List<MenuCategoryResponse> getMenuCategories(Long restaurantId);
    MenuCategoryResponse addMenuCategory(Long ownerId, Long restaurantId, String name);
    MenuCategoryResponse updateMenuCategory(Long ownerId, Long categoryId, String name);
    void deleteMenuCategory(Long ownerId, Long categoryId);
    
    MenuItemResponse addMenuItem(Long ownerId, Long restaurantId, Long categoryId, MenuItemRequest request);
    MenuItemResponse updateMenuItem(Long ownerId, Long itemId, MenuItemRequest request);
    void deleteMenuItem(Long ownerId, Long itemId);
    MenuItemResponse getMenuItem(Long id);
}
