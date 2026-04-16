package com.example.server.mapper;

import com.example.server.dto.delivery.DeliveryAssignmentResponse;
import com.example.server.dto.delivery.ShipperLocationResponse;
import com.example.server.entity.DeliveryAssignment;
import com.example.server.entity.ShipperLocation;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface DeliveryMapper {
    @Mapping(target = "orderId", source = "order.id")
    @Mapping(target = "shipperId", source = "shipper.id")
    @Mapping(target = "shipperName", source = "shipper.fullName")
    DeliveryAssignmentResponse toAssignmentResponse(DeliveryAssignment assignment);

    @Mapping(target = "shipperId", source = "shipper.id")
    ShipperLocationResponse toLocationResponse(ShipperLocation location);
}
