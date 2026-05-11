package com.example.server.service.impl;

import com.example.server.dto.restaurant.RestaurantApprovalRequest;
import com.example.server.entity.Restaurant;
import com.example.server.entity.User;
import com.example.server.exception.ResourceNotFoundException;
import com.example.server.repository.RestaurantRepository;
import com.example.server.service.NotificationService;
import com.example.server.service.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AdminServiceImplTest {

    @Mock
    private RestaurantRepository restaurantRepository;
    @Mock
    private UserService userService;
    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private AdminServiceImpl adminService;

    private Restaurant restaurant;
    private final Long restaurantId = 1L;

    @BeforeEach
    void setUp() {
        User owner = new User();
        owner.setId(2L);

        restaurant = new Restaurant();
        restaurant.setId(restaurantId);
        restaurant.setName("Test Restaurant");
        restaurant.setOwner(owner);
    }

    @Test
    void shouldApproveRestaurantSuccessfully() {
        RestaurantApprovalRequest request = new RestaurantApprovalRequest(true, "Looks good!");
        when(restaurantRepository.findById(restaurantId)).thenReturn(Optional.of(restaurant));

        adminService.approveRestaurant(restaurantId, request);

        assertTrue(restaurant.getIsApproved());
        verify(restaurantRepository).save(restaurant);
        verify(notificationService).createNotification(
                eq(2L), 
                anyString(), 
                contains("approved"), 
                eq("SYSTEM")
        );
    }

    @Test
    void shouldRejectRestaurantSuccessfully() {
        RestaurantApprovalRequest request = new RestaurantApprovalRequest(false, "Poor quality photos");
        when(restaurantRepository.findById(restaurantId)).thenReturn(Optional.of(restaurant));

        adminService.approveRestaurant(restaurantId, request);

        assertFalse(restaurant.getIsApproved());
        verify(restaurantRepository).save(restaurant);
        verify(notificationService).createNotification(
                eq(2L), 
                anyString(), 
                contains("rejected"), 
                eq("SYSTEM")
        );
    }

    @Test
    void shouldThrowExceptionWhenApprovingNonExistentRestaurant() {
        when(restaurantRepository.findById(restaurantId)).thenReturn(Optional.empty());

        RestaurantApprovalRequest request = new RestaurantApprovalRequest(true, null);
        assertThrows(ResourceNotFoundException.class, 
            () -> adminService.approveRestaurant(restaurantId, request));
    }

    @Test
    void shouldDeleteUserSuccessfully() {
        Long userId = 1L;
        adminService.deleteUser(userId);
        verify(userService).deleteUser(userId);
    }
}
