package com.example.server.service;

import com.example.server.dto.notification.MarkAllNotificationsReadRequest;
import com.example.server.dto.notification.MarkNotificationReadRequest;
import com.example.server.dto.notification.NotificationResponse;

import java.util.List;

public interface NotificationService {
    List<NotificationResponse> getUserNotifications(Long userId);
    void markAsRead(Long userId, MarkNotificationReadRequest request);
    void markAllAsRead(Long userId, MarkAllNotificationsReadRequest request);
    void createNotification(Long userId, String title, String message, String type);
}
