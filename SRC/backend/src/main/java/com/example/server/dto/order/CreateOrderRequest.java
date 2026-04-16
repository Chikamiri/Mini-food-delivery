package com.example.server.dto.order;

import java.math.BigDecimal;
import java.util.List;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateOrderRequest {
	@NotNull
	private Long restaurantId;

	private Long addressId;

	@NotNull
	private String deliveryAddress;

	@NotNull
	private BigDecimal deliveryLat;

	@NotNull
	private BigDecimal deliveryLng;

	@NotNull
	private String paymentMethod;

	private String note;

	@Valid
	@NotEmpty
	private List<CreateOrderItemRequest> items;
}

