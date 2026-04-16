package com.example.server.dto.order;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderStatusHistoryResponse {
    private Long id;
    private Long orderId;
    private String status;
    private Long changedByUserId;
    private String changedByName;
    private String note;
    private LocalDateTime createdAt;
}
