package com.example.server.dto.shipper;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ShipperRequestSubmission {
    @NotBlank(message = "Phone number is required")
    @Size(min = 10, max = 15, message = "Phone must be between 10 and 15 digits")
    private String phoneNumber;

    @NotBlank(message = "License plate is required")
    @Size(min = 4, max = 20, message = "License plate must be between 4 and 20 characters")
    private String licensePlate;
}
