package com.example.server.mapper;

import com.example.server.dto.restaurant.RestaurantCardResponse;
import com.example.server.dto.restaurant.RestaurantDetailResponse;
import com.example.server.entity.Restaurant;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", uses = {MenuMapper.class})
public interface RestaurantMapper {
    @Mapping(target = "categoryName", source = "category.name")
    RestaurantCardResponse toCardResponse(Restaurant restaurant);

    @Mapping(target = "ownerId", source = "owner.id")
    @Mapping(target = "categoryId", source = "category.id")
    @Mapping(target = "categoryName", source = "category.name")
    RestaurantDetailResponse toDetailResponse(Restaurant restaurant);
}
