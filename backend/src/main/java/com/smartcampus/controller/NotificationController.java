package com.smartcampus.controller;

import com.smartcampus.entity.Notification;
import com.smartcampus.entity.User;
import com.smartcampus.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/notifications")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    @GetMapping
    public List<Notification> getMyNotifications(@AuthenticationPrincipal User user) {
        return notificationService.getNotificationsForUser(user);
    }

    @PutMapping("/{id}/read")
    public void markAsRead(@PathVariable Long id) {
        notificationService.markAsRead(id);
    }
}
