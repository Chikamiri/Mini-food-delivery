package com.example.server.repository;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.JpaRepository;
import com.example.server.entity.MenuItem;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.lang.NonNull;
import java.util.List;
import java.util.Optional;

@Repository
public interface MenuItemRepository extends JpaRepository<MenuItem, Long> {

    @Override
    @NonNull
    @EntityGraph(attributePaths = {"category"})
    Optional<MenuItem> findById(@NonNull Long id);

    // Sử dụng JPQL để join từ MenuItem sang MenuCategory và đối chiếu restaurantId
    @EntityGraph(attributePaths = {"category"})
    @Query("SELECT m FROM MenuItem m JOIN m.category c WHERE " +
            "c.id = :categoryId AND c.restaurant.id = :restaurantId AND m.isAvailable = true")
    List<MenuItem> findBrowseItems(@Param("restaurantId") Long restaurantId,
            @Param("categoryId") Long categoryId);
}
