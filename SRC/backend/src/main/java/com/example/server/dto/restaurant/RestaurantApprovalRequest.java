package com.example.server.dto.restaurant;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RestaurantApprovalRequest {
    @NotNull
    private Boolean approved;

    private String note;
}
