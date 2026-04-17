package com.example.server.service.impl;

import com.example.server.dto.restaurant.*;
import com.example.server.entity.MenuCategory;
import com.example.server.entity.MenuItem;
import com.example.server.entity.Restaurant;
import com.example.server.exception.ResourceNotFoundException;
import com.example.server.mapper.MenuMapper;
import com.example.server.repository.MenuCategoryRepository;
import com.example.server.repository.MenuItemRepository;
import com.example.server.repository.RestaurantRepository;
import com.example.server.service.MenuService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MenuServiceImpl implements MenuService {

    private final MenuItemRepository menuItemRepository;
    private final MenuCategoryRepository menuCategoryRepository;
    private final RestaurantRepository restaurantRepository;
    private final MenuMapper menuMapper;

    @Override
    public List<MenuCategoryResponse> getMenuCategories(Long restaurantId) {
        return menuCategoryRepository.findByRestaurantIdOrderBySortOrderAsc(restaurantId).stream()
                .map(menuMapper::toCategoryResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public MenuCategoryResponse addMenuCategory(Long restaurantId, String name) {
        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new ResourceNotFoundException("Restaurant", "id", restaurantId));
        
        MenuCategory category = new MenuCategory();
        category.setRestaurant(restaurant);
        category.setName(name);
        category.setSortOrder(0);
        return menuMapper.toCategoryResponse(menuCategoryRepository.save(category));
    }

    @Override
    @Transactional
    public MenuCategoryResponse updateMenuCategory(Long categoryId, String name) {
        MenuCategory category = menuCategoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("MenuCategory", "id", categoryId));
        category.setName(name);
        return menuMapper.toCategoryResponse(menuCategoryRepository.save(category));
    }

    @Override
    @Transactional
    public void deleteMenuCategory(Long categoryId) {
        if (!menuCategoryRepository.existsById(categoryId)) {
            throw new ResourceNotFoundException("MenuCategory", "id", categoryId);
        }
        menuCategoryRepository.deleteById(categoryId);
    }

    @Override
    @Transactional
    public MenuItemResponse addMenuItem(Long restaurantId, Long categoryId, MenuItemRequest request) {
        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new ResourceNotFoundException("Restaurant", "id", restaurantId));
        MenuCategory category = menuCategoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("MenuCategory", "id", categoryId));

        MenuItem menuItem = menuMapper.toEntity(request);
        menuItem.setRestaurant(restaurant);
        menuItem.setCategory(category);
        return menuMapper.toItemResponse(menuItemRepository.save(menuItem));
    }

    @Override
    @Transactional
    public MenuItemResponse updateMenuItem(Long itemId, MenuItemRequest request) {
        MenuItem menuItem = menuItemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("MenuItem", "id", itemId));
        
        menuMapper.updateEntity(menuItem, request);
        
        if (request.getCategoryId() != null) {
            MenuCategory category = menuCategoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("MenuCategory", "id", request.getCategoryId()));
            menuItem.setCategory(category);
        }
        
        return menuMapper.toItemResponse(menuItemRepository.save(menuItem));
    }

    @Override
    @Transactional
    public void deleteMenuItem(Long itemId) {
        MenuItem menuItem = menuItemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("MenuItem", "id", itemId));
        menuItem.setIsDeleted(true);
        menuItemRepository.save(menuItem);
    }

    @Override
    public MenuItemResponse getMenuItem(Long id) {
        MenuItem menuItem = menuItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("MenuItem", "id", id));
        return menuMapper.toItemResponse(menuItem);
    }
}
