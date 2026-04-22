package com.example.server.dto.restaurant;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalTime;

@Data
public class RestaurantRequest {
    @NotBlank(message = "Restaurant name is required")
    private String name;

    private String description;

    @NotBlank(message = "Phone number is required")
    @Size(max = 15, message = "Phone number must not exceed 15 characters")
    private String phone;

    @NotBlank(message = "Address is required")
    private String address;

    private BigDecimal latitude;
    private BigDecimal longitude;
    private String imageUrl;
    
    @NotNull(message = "Opening time is required")
    private LocalTime openingTime;
    
    @NotNull(message = "Closing time is required")
    private LocalTime closingTime;

    private Long categoryId;
    private Boolean isOpen = true;
}
