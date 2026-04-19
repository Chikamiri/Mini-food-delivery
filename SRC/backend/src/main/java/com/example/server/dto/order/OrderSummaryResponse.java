package com.example.server.dto.order;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderSummaryResponse {
    private Long id;
    private Long userId;
    private Long restaurantId;
    private String restaurantName;
    private String deliveryAddress;
    private BigDecimal subtotal;
    private BigDecimal deliveryFee;
    private BigDecimal totalAmount;
    private String paymentMethod;
    private String status;
    private Boolean isPaid;
    private String note;
    private LocalDateTime createdAt;
}
