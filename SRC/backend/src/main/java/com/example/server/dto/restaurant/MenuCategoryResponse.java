package com.example.server.dto.restaurant;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MenuCategoryResponse {
    private Long id;
    private Long restaurantId;
    private String name;
    private Integer sortOrder;
}
