package com.example.server.service.impl;

import com.example.server.dto.restaurant.*;
import com.example.server.entity.MenuCategory;
import com.example.server.entity.MenuItem;
import com.example.server.entity.Restaurant;
import com.example.server.exception.AppException;
import com.example.server.exception.ResourceNotFoundException;
import com.example.server.mapper.MenuMapper;
import com.example.server.repository.MenuCategoryRepository;
import com.example.server.repository.MenuItemRepository;
import com.example.server.repository.RestaurantRepository;
import com.example.server.service.MenuService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MenuServiceImpl implements MenuService {

    private static final String RESOURCE_RESTAURANT = "Restaurant";
    private static final String RESOURCE_CATEGORY = "MenuCategory";
    private static final String RESOURCE_ITEM = "MenuItem";

    private final MenuItemRepository menuItemRepository;
    private final MenuCategoryRepository menuCategoryRepository;
    private final RestaurantRepository restaurantRepository;
    private final MenuMapper menuMapper;

    @Override
    public List<MenuCategoryResponse> getMenuCategories(Long restaurantId) {
        return menuCategoryRepository.findByRestaurantIdOrderBySortOrderAsc(restaurantId).stream()
                .filter(c -> Boolean.FALSE.equals(c.getIsDeleted()))
                .map(menuMapper::toCategoryResponse)
                .toList();
    }

    @Override
    @Transactional
    public MenuCategoryResponse addMenuCategory(Long ownerId, Long restaurantId, MenuCategoryRequest request) {
        Restaurant restaurant = validateRestaurantOwnership(ownerId, restaurantId);

        MenuCategory category = new MenuCategory();
        category.setRestaurant(restaurant);
        category.setName(request.getName());
        category.setSortOrder(0);
        category.setIsDeleted(false);
        return menuMapper.toCategoryResponse(menuCategoryRepository.save(category));
    }

    @Override
    @Transactional
    public MenuCategoryResponse updateMenuCategory(Long ownerId, Long categoryId, MenuCategoryRequest request) {
        MenuCategory category = menuCategoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException(RESOURCE_CATEGORY, "id", categoryId));

        validateRestaurantOwnership(ownerId, category.getRestaurant().getId());

        category.setName(request.getName());
        return menuMapper.toCategoryResponse(menuCategoryRepository.save(category));
    }

    @Override
    @Transactional
    public void deleteMenuCategory(Long ownerId, Long categoryId) {
        MenuCategory category = menuCategoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException(RESOURCE_CATEGORY, "id", categoryId));

        validateRestaurantOwnership(ownerId, category.getRestaurant().getId());

        category.setIsDeleted(true);
        menuCategoryRepository.save(category);
    }

    @Override
    @Transactional
    public MenuItemResponse addMenuItem(Long ownerId, Long restaurantId, Long categoryId, MenuItemRequest request) {
        Restaurant restaurant = validateRestaurantOwnership(ownerId, restaurantId);
        MenuCategory category = menuCategoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException(RESOURCE_CATEGORY, "id", categoryId));

        if (!category.getRestaurant().getId().equals(restaurantId)) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Category does not belong to this restaurant",
                    "INVALID_CATEGORY");
        }

        MenuItem menuItem = menuMapper.toEntity(request);
        menuItem.setRestaurant(restaurant);
        menuItem.setCategory(category);
        menuItem.setIsDeleted(false);
        return menuMapper.toItemResponse(menuItemRepository.save(menuItem));
    }

    @Override
    @Transactional
    public MenuItemResponse updateMenuItem(Long ownerId, Long itemId, MenuItemRequest request) {
        MenuItem menuItem = menuItemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException(RESOURCE_ITEM, "id", itemId));

        validateRestaurantOwnership(ownerId, menuItem.getRestaurant().getId());

        menuMapper.updateEntity(menuItem, request);

        if (request.getCategoryId() != null) {
            MenuCategory category = menuCategoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("MenuCategory", "id", request.getCategoryId()));

            if (!category.getRestaurant().getId().equals(menuItem.getRestaurant().getId())) {
                throw new AppException(HttpStatus.BAD_REQUEST, "Category does not belong to this restaurant",
                        "INVALID_CATEGORY");
            }
            menuItem.setCategory(category);
        }

        return menuMapper.toItemResponse(menuItemRepository.save(menuItem));
    }

    @Override
    @Transactional
    public void deleteMenuItem(Long ownerId, Long itemId) {
        MenuItem menuItem = menuItemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException(RESOURCE_ITEM, "id", itemId));

        validateRestaurantOwnership(ownerId, menuItem.getRestaurant().getId());

        menuItem.setIsDeleted(true);
        menuItemRepository.save(menuItem);
    }

    @Override
    public MenuItemResponse getMenuItem(Long id) {
        MenuItem menuItem = menuItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(RESOURCE_ITEM, "id", id));

        if (Boolean.TRUE.equals(menuItem.getIsDeleted())) {
            throw new ResourceNotFoundException(RESOURCE_ITEM, "id", id);
        }

        return menuMapper.toItemResponse(menuItem);
    }

    private Restaurant validateRestaurantOwnership(Long ownerId, Long restaurantId) {
        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new ResourceNotFoundException(RESOURCE_RESTAURANT, "id", restaurantId));

        if (!restaurant.getOwner().getId().equals(ownerId)) {
            throw new AppException(HttpStatus.FORBIDDEN, "User does not own this restaurant",
                    "UNAUTHORIZED_RESTAURANT_ACCESS");
        }
        return restaurant;
    }
}
