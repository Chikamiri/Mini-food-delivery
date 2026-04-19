package com.example.server.dto.delivery;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MarkDeliveredRequest {
    private String note;
    private Boolean codCollected;
}
