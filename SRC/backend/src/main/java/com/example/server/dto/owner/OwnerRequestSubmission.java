package com.example.server.dto.owner;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class OwnerRequestSubmission {
    @NotBlank(message = "Restaurant name is required")
    private String restaurantName;

    @NotBlank(message = "Restaurant address is required")
    private String restaurantAddress;

    @NotBlank(message = "Restaurant phone is required")
    @Size(min = 10, max = 15, message = "Phone must be between 10 and 15 digits")
    private String restaurantPhone;

    private String description;
}
