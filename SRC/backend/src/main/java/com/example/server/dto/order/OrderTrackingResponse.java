package com.example.server.dto.order;

import com.example.server.dto.delivery.DeliveryAssignmentResponse;
import java.time.LocalDateTime;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderTrackingResponse {
    private Long orderId;
    private String status;
    private LocalDateTime updatedAt;
    private List<OrderStatusHistoryResponse> timeline;
    private DeliveryAssignmentResponse assignment;
}
