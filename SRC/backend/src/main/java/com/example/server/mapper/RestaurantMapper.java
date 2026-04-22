package com.example.server.mapper;

import com.example.server.dto.restaurant.RestaurantCardResponse;
import com.example.server.dto.restaurant.RestaurantDetailResponse;
import com.example.server.dto.restaurant.RestaurantRequest;
import com.example.server.entity.Restaurant;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring", uses = {MenuMapper.class})
public interface RestaurantMapper {
    @Mapping(target = "categoryName", source = "category.name")
    RestaurantCardResponse toCardResponse(Restaurant restaurant);

    @Mapping(target = "ownerId", source = "owner.id")
    @Mapping(target = "categoryId", source = "category.id")
    @Mapping(target = "categoryName", source = "category.name")
    RestaurantDetailResponse toDetailResponse(Restaurant restaurant);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "owner", ignore = true)
    @Mapping(target = "category", ignore = true)
    @Mapping(target = "isApproved", ignore = true)
    @Mapping(target = "isDeleted", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "menuItems", ignore = true)
    @Mapping(target = "orders", ignore = true)
    Restaurant toEntity(RestaurantRequest request);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "owner", ignore = true)
    @Mapping(target = "category", ignore = true)
    @Mapping(target = "isApproved", ignore = true)
    @Mapping(target = "isDeleted", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "menuItems", ignore = true)
    @Mapping(target = "orders", ignore = true)
    void updateEntity(@MappingTarget Restaurant restaurant, RestaurantRequest request);
}
