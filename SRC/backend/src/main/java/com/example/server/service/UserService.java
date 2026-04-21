package com.example.server.service;

import com.example.server.dto.user.*;
import java.util.List;

public interface UserService {
    UserProfileResponse getUserProfile(Long id);
    UserProfileResponse updateUserProfile(Long id, UserProfileUpdateRequest request);
    void updateUserRole(Long id, UserRoleUpdateRequest request);
    void updateUserStatus(Long id, UserStatusUpdateRequest request);
    List<AddressResponse> getUserAddresses(Long userId);
    AddressResponse addAddress(Long userId, AddressRequest request);
    AddressResponse updateAddress(Long userId, Long addressId, AddressRequest request);
    void deleteAddress(Long userId, Long addressId);
    void setDefaultAddress(Long userId, Long addressId);
}
