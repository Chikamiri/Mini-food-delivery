package com.example.server.service.impl;

import com.example.server.dto.user.*;
import com.example.server.entity.Address;
import com.example.server.entity.User;
import com.example.server.enums.Role;
import com.example.server.exception.AppException;
import com.example.server.exception.ResourceNotFoundException;
import com.example.server.mapper.AddressMapper;
import com.example.server.mapper.UserMapper;
import com.example.server.repository.AddressRepository;
import com.example.server.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceImplTest {

    @Mock
    private UserRepository userRepository;
    @Mock
    private AddressRepository addressRepository;
    @Mock
    private UserMapper userMapper;
    @Mock
    private AddressMapper addressMapper;

    @InjectMocks
    private UserServiceImpl userService;

    private User user;
    private Address address;
    private Long userId = 1L;
    private Long addressId = 2L;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setId(userId);
        user.setFullName("Old Name");
        user.setPhone("123456789");

        address = new Address();
        address.setId(addressId);
        address.setUser(user);
        address.setIsDefault(false);
    }

    @Test
    void shouldGetUserProfileSuccessfully() {
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(userMapper.toProfileResponse(user)).thenReturn(new UserProfileResponse());

        var response = userService.getUserProfile(userId);

        assertNotNull(response);
        verify(userRepository).findById(userId);
    }

    @Test
    void shouldUpdateUserProfileSuccessfully() {
        UserProfileUpdateRequest request = new UserProfileUpdateRequest();
        request.setFullName("New Name");
        request.setPhone("987654321");

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(userRepository.save(any(User.class))).thenReturn(user);
        when(userMapper.toProfileResponse(any(User.class))).thenReturn(new UserProfileResponse());

        var response = userService.updateUserProfile(userId, request);

        assertNotNull(response);
        assertEquals("New Name", user.getFullName());
        assertEquals("987654321", user.getPhone());
    }

    @Test
    void shouldUpdateUserRoleSuccessfully() {
        UserRoleUpdateRequest request = new UserRoleUpdateRequest();
        request.setRole(Role.ROLE_ADMIN);

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));

        userService.updateUserRole(userId, request);

        assertEquals(Role.ROLE_ADMIN, user.getRole());
        verify(userRepository).save(user);
    }

    @Test
    void shouldUpdateUserStatusSuccessfully() {
        UserStatusUpdateRequest request = new UserStatusUpdateRequest();
        request.setActive(false);

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));

        userService.updateUserStatus(userId, request);

        assertFalse(user.getActive());
        verify(userRepository).save(user);
    }

    @Test
    void shouldGetUserAddressesSuccessfully() {
        when(addressRepository.findByUserId(userId)).thenReturn(Collections.singletonList(address));
        when(addressMapper.toResponse(address)).thenReturn(new AddressResponse());

        List<AddressResponse> responses = userService.getUserAddresses(userId);

        assertEquals(1, responses.size());
    }

    @Test
    void shouldAddAddressSuccessfully() {
        AddressRequest request = new AddressRequest();
        request.setIsDefault(true);

        Address existingDefault = new Address();
        existingDefault.setIsDefault(true);

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(addressRepository.findByUserIdAndIsDefaultTrue(userId)).thenReturn(Optional.of(existingDefault));
        when(addressMapper.toEntity(request)).thenReturn(address);
        when(addressRepository.save(any(Address.class))).thenReturn(address);
        when(addressMapper.toResponse(address)).thenReturn(new AddressResponse());

        var response = userService.addAddress(userId, request);

        assertNotNull(response);
        assertFalse(existingDefault.getIsDefault());
        verify(addressRepository).save(existingDefault);
        verify(addressRepository).save(address);
    }

    @Test
    void shouldUpdateAddressSuccessfully() {
        AddressRequest request = new AddressRequest();
        request.setIsDefault(true);

        when(addressRepository.findById(addressId)).thenReturn(Optional.of(address));
        when(addressRepository.findByUserIdAndIsDefaultTrue(userId)).thenReturn(Optional.empty());
        when(addressRepository.save(address)).thenReturn(address);
        when(addressMapper.toResponse(address)).thenReturn(new AddressResponse());

        var response = userService.updateAddress(userId, addressId, request);

        assertNotNull(response);
        verify(addressRepository).save(address);
    }

    @Test
    void shouldThrowExceptionWhenUpdatingOtherUserAddress() {
        AddressRequest request = new AddressRequest();
        when(addressRepository.findById(addressId)).thenReturn(Optional.of(address));

        AppException ex = assertThrows(AppException.class, () -> userService.updateAddress(999L, addressId, request));
        assertEquals(HttpStatus.FORBIDDEN, ex.getStatus());
    }

    @Test
    void shouldDeleteAddressSuccessfully() {
        when(addressRepository.findById(addressId)).thenReturn(Optional.of(address));

        userService.deleteAddress(userId, addressId);

        verify(addressRepository).delete(address);
    }

    @Test
    void shouldSetDefaultAddressSuccessfully() {
        Address otherDefault = new Address();
        otherDefault.setIsDefault(true);

        when(addressRepository.findById(addressId)).thenReturn(Optional.of(address));
        when(addressRepository.findByUserIdAndIsDefaultTrue(userId)).thenReturn(Optional.of(otherDefault));

        userService.setDefaultAddress(userId, addressId);

        assertTrue(address.getIsDefault());
        assertFalse(otherDefault.getIsDefault());
        verify(addressRepository).save(otherDefault);
        verify(addressRepository).save(address);
    }

    @Test
    void shouldDeleteUserSuccessfully() {
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));

        userService.deleteUser(userId);

        verify(userRepository).delete(user);
    }

    @Test
    void shouldThrowExceptionWhenUserNotFound() {
        when(userRepository.findById(userId)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> userService.getUserProfile(userId));
    }
}
