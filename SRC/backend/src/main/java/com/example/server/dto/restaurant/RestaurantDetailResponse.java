package com.example.server.dto.restaurant;

import java.math.BigDecimal;
import java.time.LocalTime;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RestaurantDetailResponse {
    private Long id;
    private Long ownerId;
    private Long categoryId;
    private String categoryName;
    private String name;
    private String description;
    private String phone;
    private String address;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private String imageUrl;
    private LocalTime openingTime;
    private LocalTime closingTime;
    private Boolean isOpen;
    private Boolean isApproved;
    private List<MenuItemResponse> menuItems;
}
