package com.example.server.dto.user;

import java.math.BigDecimal;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AddressRequest {
    private String label;

    @NotBlank
    private String addressLine;

    @NotNull
    private BigDecimal latitude;

    @NotNull
    private BigDecimal longitude;

    private Boolean isDefault;
}
