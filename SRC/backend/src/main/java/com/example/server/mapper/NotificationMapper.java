package com.example.server.mapper;

import com.example.server.dto.notification.NotificationResponse;
import com.example.server.entity.Notification;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface NotificationMapper {
    @Mapping(source = "user.id", target = "userId")
    NotificationResponse toResponse(Notification notification);
}
