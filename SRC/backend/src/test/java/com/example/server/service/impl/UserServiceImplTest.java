package com.example.server.service.impl;

import com.example.server.entity.User;
import com.example.server.exception.ResourceNotFoundException;
import com.example.server.repository.AddressRepository;
import com.example.server.repository.UserRepository;
import com.example.server.mapper.AddressMapper;
import com.example.server.mapper.UserMapper;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertThrows;
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

    @Test
    void deleteUser_Success() {
        Long userId = 1L;
        User user = new User();
        user.setId(userId);

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));

        userService.deleteUser(userId);

        verify(userRepository).delete(user);
    }

    @Test
    void deleteUser_NotFound_ShouldThrowException() {
        Long userId = 1L;
        when(userRepository.findById(userId)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> userService.deleteUser(userId));
        verify(userRepository, never()).delete(any());
    }
}
