package com.example.server.repository;

import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import com.example.server.entity.ShipperLocation;
import java.util.Optional;
import java.util.List;

@Repository
public interface ShipperLocationRepository extends JpaRepository<ShipperLocation, Long> {
    List<ShipperLocation> findByIsOnlineTrue();

    Optional<ShipperLocation> findByShipperIDId(Long userId);

    // toggleOnlineStatus(status)
    @Modifying
    @Query("UPDATE ShipperLocation s SET s.isOnline = :status WHERE s.shipperID.id = :userId")
    void updateOnlineStatus(@Param("userId") Long userId, @Param("status") boolean status);
}
