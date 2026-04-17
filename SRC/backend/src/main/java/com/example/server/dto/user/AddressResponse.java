package com.example.server.dto.user;

import java.math.BigDecimal;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AddressResponse {
    private Long id;
    private String label;
    private String addressLine;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private Boolean isDefault;
}
