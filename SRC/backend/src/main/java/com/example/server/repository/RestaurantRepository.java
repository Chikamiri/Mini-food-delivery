package com.example.server.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import com.example.server.entity.Restaurant;
import java.util.List;

@Repository
public interface RestaurantRepository extends JpaRepository<Restaurant, Long> {
        // search(keywords, categoryId)
        @Query("SELECT r FROM Restaurant r LEFT JOIN r.category c WHERE " +
                        "(:categoryId IS NULL OR c.id = :categoryId) AND " +
                        "(:keywords IS NULL OR LOWER(r.name) LIKE LOWER(CONCAT('%', :keywords, '%'))) AND " +
                        "r.isApproved = true AND r.isDeleted = false")
        Page<Restaurant> searchRestaurants(@Param("keywords") String keywords,
                        @Param("categoryId") Long categoryId,
                        Pageable pageable);

        Page<Restaurant> findByIsApprovedFalse(Pageable pageable);

        @Modifying
        @Query("UPDATE Restaurant r SET r.isApproved = true WHERE r.id = :id")
        void approveRestaurant(@Param("id") Long id);

        List<Restaurant> findByOwnerId(Long ownerId);
}
