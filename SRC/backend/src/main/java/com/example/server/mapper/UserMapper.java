package com.example.server.mapper;

import com.example.server.dto.user.UserProfileResponse;
import com.example.server.entity.User;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring", uses = {AddressMapper.class})
public interface UserMapper {
    UserProfileResponse toProfileResponse(User user);
}
