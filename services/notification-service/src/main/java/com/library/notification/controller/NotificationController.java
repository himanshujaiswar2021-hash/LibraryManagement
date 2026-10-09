package com.library.notification.controller;

import com.library.notification.dto.NotificationDto.NotificationResponse;
import com.library.notification.dto.NotificationDto.SendNotificationRequest;
import com.library.notification.dto.NotificationDto.UnreadCountResponse;
import com.library.notification.service.NotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/notifications")
@Tag(name = "Notifications", description = "Notification and Alert APIs")
@CrossOrigin(origins = "*")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @PostMapping("/send")
    @Operation(summary = "Send a new notification")
    public ResponseEntity<Map<String, Object>> sendNotification(@Valid @RequestBody SendNotificationRequest request) {
        NotificationResponse response = notificationService.sendNotification(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "success", true,
                "data", response
        ));
    }

    @GetMapping("/recipient/{recipientId}")
    @Operation(summary = "Get paginated notifications for a recipient")
    public ResponseEntity<Map<String, Object>> getRecipientNotifications(
            @PathVariable UUID recipientId,
            @PageableDefault(size = 20) Pageable pageable) {
        Page<NotificationResponse> page = notificationService.getRecipientNotifications(recipientId, pageable);
        return ResponseEntity.ok(Map.of(
                "success", true,
                "data", page
        ));
    }

    @GetMapping("/recipient/{recipientId}/unread")
    @Operation(summary = "Get unread notifications list for recipient")
    public ResponseEntity<Map<String, Object>> getUnreadNotifications(@PathVariable UUID recipientId) {
        List<NotificationResponse> list = notificationService.getUnreadNotifications(recipientId);
        return ResponseEntity.ok(Map.of(
                "success", true,
                "data", list
        ));
    }

    @GetMapping("/recipient/{recipientId}/unread-count")
    @Operation(summary = "Get unread count for badge display")
    public ResponseEntity<Map<String, Object>> getUnreadCount(@PathVariable UUID recipientId) {
        UnreadCountResponse count = notificationService.getUnreadCount(recipientId);
        return ResponseEntity.ok(Map.of(
                "success", true,
                "data", count
        ));
    }

    @PatchMapping("/{id}/read")
    @Operation(summary = "Mark single notification as read")
    public ResponseEntity<Map<String, Object>> markAsRead(@PathVariable UUID id) {
        NotificationResponse response = notificationService.markAsRead(id);
        return ResponseEntity.ok(Map.of(
                "success", true,
                "data", response
        ));
    }

    @PatchMapping("/recipient/{recipientId}/read-all")
    @Operation(summary = "Mark all notifications as read for recipient")
    public ResponseEntity<Map<String, Object>> markAllAsRead(@PathVariable UUID recipientId) {
        notificationService.markAllAsRead(recipientId);
        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "All notifications marked as read"
        ));
    }

    @GetMapping("/logs")
    @Operation(summary = "Get all delivery logs (Audit & Admin)")
    public ResponseEntity<Map<String, Object>> getLogs(@PageableDefault(size = 20) Pageable pageable) {
        Page<NotificationResponse> page = notificationService.getAllLogs(pageable);
        return ResponseEntity.ok(Map.of(
                "success", true,
                "data", page
        ));
    }
}
