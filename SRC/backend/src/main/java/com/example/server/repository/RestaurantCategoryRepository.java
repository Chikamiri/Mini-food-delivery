package com.example.server.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.example.server.entity.RestaurantCategory;
import java.util.List;

@Repository
public interface RestaurantCategoryRepository extends JpaRepository<RestaurantCategory, Long> {
    List<RestaurantCategory> findAllByOrderByNameAsc();
}