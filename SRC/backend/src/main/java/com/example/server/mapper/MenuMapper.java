package com.example.server.mapper;

import com.example.server.dto.restaurant.MenuItemRequest;
import com.example.server.dto.restaurant.MenuItemResponse;
import com.example.server.dto.restaurant.MenuCategoryResponse;
import com.example.server.entity.MenuItem;
import com.example.server.entity.MenuCategory;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface MenuMapper {
    @Mapping(target = "restaurantId", source = "restaurant.id")
    @Mapping(target = "categoryId", source = "category.id")
    @Mapping(target = "categoryName", source = "category.name")
    MenuItemResponse toItemResponse(MenuItem menuItem);

    @Mapping(target = "restaurantId", source = "restaurant.id")
    MenuCategoryResponse toCategoryResponse(MenuCategory category);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "restaurant", ignore = true)
    @Mapping(target = "category", ignore = true)
    @Mapping(target = "isDeleted", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "orderItems", ignore = true)
    MenuItem toEntity(MenuItemRequest request);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "restaurant", ignore = true)
    @Mapping(target = "category", ignore = true)
    @Mapping(target = "isDeleted", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "orderItems", ignore = true)
    void updateEntity(@MappingTarget MenuItem menuItem, MenuItemRequest request);
}
