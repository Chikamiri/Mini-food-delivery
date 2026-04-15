package com.example.server.repository;

import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.JpaRepository;
import com.example.server.entity.Notification;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
}
