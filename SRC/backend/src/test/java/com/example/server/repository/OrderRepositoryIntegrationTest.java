package com.example.server.repository;

import com.example.server.BaseIntegrationTest;
import com.example.server.entity.Order;
import com.example.server.entity.Restaurant;
import com.example.server.entity.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class OrderRepositoryIntegrationTest extends BaseIntegrationTest {

    @Autowired
    private OrderRepository orderRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private RestaurantRepository restaurantRepository;

    private User customer;
    private Restaurant restaurant;

    @BeforeEach
    void setUp() {
        User owner = new User();
        owner.setEmail("owner_int@test.com");
        owner.setPassword("password");
        owner.setFullName("Restaurant Owner");
        owner.setRole("OWNER");
        owner.setCreatedAt(java.time.LocalDateTime.now());
        owner.setUpdatedAt(java.time.LocalDateTime.now());
        userRepository.save(owner);

        customer = new User();
        customer.setEmail("customer_int@test.com");
        customer.setPassword("password");
        customer.setFullName("Customer");
        customer.setRole("CUSTOMER");
        customer.setCreatedAt(java.time.LocalDateTime.now());
        customer.setUpdatedAt(java.time.LocalDateTime.now());
        userRepository.save(customer);

        restaurant = new Restaurant();
        restaurant.setOwner(owner);
        restaurant.setName("Test Restaurant");
        restaurant.setAddress("Restaurant Address");
        restaurant.setCreatedAt(java.time.LocalDateTime.now());
        restaurant.setUpdatedAt(java.time.LocalDateTime.now());
        restaurantRepository.save(restaurant);
    }

    @Test
    void shouldFindOrdersNearLocation() {
        // Center: 10.0, 10.0
        BigDecimal centerLat = new BigDecimal("10.00000000");
        BigDecimal centerLng = new BigDecimal("10.00000000");

        // Order 1: Near (Approx 0.5 km)
        Order order1 = createOrder("Near Order", new BigDecimal("10.00300000"), new BigDecimal("10.00300000"), "READY");

        // Order 2: Far (Approx 15 km)
        Order order2 = createOrder("Far Order", new BigDecimal("10.10000000"), new BigDecimal("10.10000000"), "READY");

        // Order 3: Near but PENDING (should be excluded by query status filter)
        Order order3 = createOrder("Near Pending", new BigDecimal("10.00100000"), new BigDecimal("10.00100000"),
                "PENDING");

        orderRepository.saveAllAndFlush(List.of(order1, order2, order3));

        // Search within 5km
        List<Order> found = orderRepository.findAvailableOrdersNearLocation(centerLat, centerLng, 5.0);

        assertEquals(1, found.size());
        assertEquals("Near Order", found.get(0).getDeliveryAddress());
    }

    private Order createOrder(String addr, BigDecimal lat, BigDecimal lng, String status) {
        Order order = new Order();
        order.setUser(customer);
        order.setRestaurant(restaurant);
        order.setDeliveryAddress(addr);
        order.setDeliveryLat(lat);
        order.setDeliveryLng(lng);
        order.setSubtotal(new BigDecimal("10.00"));
        order.setTotalAmount(new BigDecimal("12.00"));
        order.setStatus(status);
        order.setCreatedAt(java.time.LocalDateTime.now());
        order.setUpdatedAt(java.time.LocalDateTime.now());
        return order;
    }
}
