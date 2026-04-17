package com.example.server.dto.restaurant;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RestaurantCardResponse {
    private Long id;
    private String name;
    private String address;
    private String imageUrl;
    private Boolean isOpen;
    private Boolean isApproved;
    private String categoryName;
}
