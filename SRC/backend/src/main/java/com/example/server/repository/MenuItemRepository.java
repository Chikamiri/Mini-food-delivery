package com.example.server.repository;

import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.JpaRepository;
import com.example.server.entity.MenuItem;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

@Repository
public interface MenuItemRepository extends JpaRepository<MenuItem, Long> {

    // Sử dụng JPQL để join từ MenuItem sang MenuCategory và đối chiếu restaurantId
    @Query("SELECT m FROM MenuItem m JOIN m.category c WHERE " +
            "c.id = :categoryId AND c.restaurant.id = :restaurantId AND m.isAvailable = true")
    List<MenuItem> findBrowseItems(@Param("restaurantId") Long restaurantId,
            @Param("categoryId") Long categoryId);
}
