package com.example.server.repository;

import com.example.server.entity.Order;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    Page<Order> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);

    @Query("SELECT o FROM Order o WHERE o.status = 'DELIVERED' AND o.createdAt BETWEEN :startDate AND :endDate")
    List<Order> findDeliveredOrdersForReport(@Param("startDate") LocalDateTime startDate,
                                           @Param("endDate") LocalDateTime endDate);

    List<Order> findByRestaurantIdAndStatus(Long restaurantId, String status);

    @Query(value = "SELECT o.*, (6371 * acos(cos(radians(:lat)) * cos(radians(o.delivery_lat)) * " +
            "cos(radians(o.delivery_lng) - radians(:lng)) + sin(radians(:lat)) * " +
            "sin(radians(o.delivery_lat)))) AS distance " +
            "FROM orders o WHERE o.status = 'READY' " +
            "HAVING distance < :radius ORDER BY distance ASC", nativeQuery = true)
    List<Order> findAvailableOrdersNearLocation(@Param("lat") BigDecimal lat,
                                              @Param("lng") BigDecimal lng,
                                              @Param("radius") double radiusInKm);

    @Modifying
    @Query("UPDATE Order o SET o.status = :status WHERE o.id = :orderId")
    void updateOrderStatus(@Param("orderId") Long orderId, @Param("status") String status);

    @Query("SELECT COUNT(o) FROM Order o WHERE o.status = 'DELIVERED' AND o.createdAt BETWEEN :startDate AND :endDate")
    Long countDeliveredOrders(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    @Query("SELECT SUM(o.totalAmount) FROM Order o WHERE o.status = 'DELIVERED' AND o.createdAt BETWEEN :startDate AND :endDate")
    BigDecimal sumTotalRevenue(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
}
