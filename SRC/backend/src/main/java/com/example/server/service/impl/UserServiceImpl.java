package com.example.server.service.impl;

import com.example.server.dto.user.*;
import com.example.server.entity.Address;
import com.example.server.entity.User;
import com.example.server.exception.AppException;
import com.example.server.exception.ResourceNotFoundException;
import com.example.server.mapper.AddressMapper;
import com.example.server.mapper.UserMapper;
import com.example.server.repository.AddressRepository;
import com.example.server.repository.UserRepository;
import com.example.server.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private static final String RESOURCE_USER = "User";
    private static final String RESOURCE_ADDRESS = "Address";

    private final UserRepository userRepository;
    private final AddressRepository addressRepository;
    private final UserMapper userMapper;
    private final AddressMapper addressMapper;

    @Override
    public UserProfileResponse getUserProfile(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(RESOURCE_USER, "id", id));
        return userMapper.toProfileResponse(user);
    }

    @Override
    @Transactional
    public UserProfileResponse updateUserProfile(Long id, UserProfileResponse request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(RESOURCE_USER, "id", id));
        user.setFullName(request.getFullName());
        user.setPhone(request.getPhone());
        user.setAvatarUrl(request.getAvatarUrl());
        return userMapper.toProfileResponse(userRepository.save(user));
    }

    @Override
    @Transactional
    public void updateUserRole(Long id, UserRoleUpdateRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(RESOURCE_USER, "id", id));
        user.setRole(request.getRole());
        userRepository.save(user);
    }

    @Override
    @Transactional
    public void updateUserStatus(Long id, UserStatusUpdateRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(RESOURCE_USER, "id", id));
        user.setActive(request.getActive());
        userRepository.save(user);
    }

    @Override
    public List<AddressResponse> getUserAddresses(Long userId) {
        return addressRepository.findByUserId(userId).stream()
                .map(addressMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public AddressResponse addAddress(Long userId, AddressRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException(RESOURCE_USER, "id", userId));

        if (Boolean.TRUE.equals(request.getIsDefault())) {
            resetDefaultAddress(userId);
        }

        Address address = addressMapper.toEntity(request);
        address.setUser(user);
        return addressMapper.toResponse(addressRepository.save(address));
    }

    @Override
    @Transactional
    public AddressResponse updateAddress(Long userId, Long addressId, AddressRequest request) {
        Address address = addressRepository.findById(addressId)
                .orElseThrow(() -> new ResourceNotFoundException(RESOURCE_ADDRESS, "id", addressId));

        if (!address.getUser().getId().equals(userId)) {
            throw new AppException(HttpStatus.FORBIDDEN, "Address does not belong to user", "UNAUTHORIZED_ADDRESS_ACCESS");
        }

        if (Boolean.TRUE.equals(request.getIsDefault())) {
            resetDefaultAddress(userId);
        }

        addressMapper.updateEntity(address, request);
        return addressMapper.toResponse(addressRepository.save(address));
    }

    @Override
    @Transactional
    public void deleteAddress(Long userId, Long addressId) {
        Address address = addressRepository.findById(addressId)
                .orElseThrow(() -> new ResourceNotFoundException(RESOURCE_ADDRESS, "id", addressId));

        if (!address.getUser().getId().equals(userId)) {
            throw new AppException(HttpStatus.FORBIDDEN, "Address does not belong to user", "UNAUTHORIZED_ADDRESS_ACCESS");
        }

        addressRepository.delete(address);
    }

    @Override
    @Transactional
    public void setDefaultAddress(Long userId, Long addressId) {
        Address address = addressRepository.findById(addressId)
                .orElseThrow(() -> new ResourceNotFoundException(RESOURCE_ADDRESS, "id", addressId));

        if (!address.getUser().getId().equals(userId)) {
            throw new AppException(HttpStatus.FORBIDDEN, "Address does not belong to user", "UNAUTHORIZED_ADDRESS_ACCESS");
        }

        resetDefaultAddress(userId);
        address.setIsDefault(true);
        addressRepository.save(address);
    }

    private void resetDefaultAddress(Long userId) {
        addressRepository.findByUserIdAndIsDefaultTrue(userId)
                .ifPresent(addr -> {
                    addr.setIsDefault(false);
                    addressRepository.save(addr);
                });
    }
}
