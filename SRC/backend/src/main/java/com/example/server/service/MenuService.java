package com.example.server.service;

import com.example.server.dto.restaurant.*;
import java.util.List;

public interface MenuService {
    List<MenuCategoryResponse> getMenuCategories(Long restaurantId);
    MenuCategoryResponse addMenuCategory(Long restaurantId, String name);
    MenuCategoryResponse updateMenuCategory(Long categoryId, String name);
    void deleteMenuCategory(Long categoryId);
    
    MenuItemResponse addMenuItem(Long restaurantId, Long categoryId, MenuItemRequest request);
    MenuItemResponse updateMenuItem(Long itemId, MenuItemRequest request);
    void deleteMenuItem(Long itemId);
    MenuItemResponse getMenuItem(Long id);
}
