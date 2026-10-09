package com.library.notification.service;

import com.library.notification.domain.Notification;
import com.library.notification.domain.NotificationStatus;
import com.library.notification.dto.NotificationDto.NotificationResponse;
import com.library.notification.dto.NotificationDto.SendNotificationRequest;
import com.library.notification.dto.NotificationDto.UnreadCountResponse;
import com.library.notification.repository.NotificationRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class NotificationService {

    private static final Logger log = LoggerFactory.getLogger(NotificationService.class);

    private final NotificationRepository notificationRepository;

    public NotificationService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    @Transactional
    public NotificationResponse sendNotification(SendNotificationRequest request) {
        log.info("Dispatching notification [{}] to recipient: {} via {}", 
                request.type(), request.recipientEmail(), request.channel());

        Notification notification = new Notification(
                request.recipientId(),
                request.recipientEmail(),
                request.recipientPhone(),
                request.type(),
                request.channel(),
                request.title(),
                request.message()
        );

        // Simulate multi-channel dispatch
        notification.setStatus(NotificationStatus.DELIVERED);
        Notification saved = notificationRepository.save(notification);

        log.info("Notification successfully dispatched and recorded with ID: {}", saved.getId());
        return NotificationResponse.from(saved);
    }

    @Transactional(readOnly = true)
    public Page<NotificationResponse> getRecipientNotifications(UUID recipientId, Pageable pageable) {
        return notificationRepository.findByRecipientIdOrderByCreatedAtDesc(recipientId, pageable)
                .map(NotificationResponse::from);
    }

    @Transactional(readOnly = true)
    public List<NotificationResponse> getUnreadNotifications(UUID recipientId) {
        return notificationRepository.findByRecipientIdAndIsReadFalseOrderByCreatedAtDesc(recipientId)
                .stream()
                .map(NotificationResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public UnreadCountResponse getUnreadCount(UUID recipientId) {
        long count = notificationRepository.countByRecipientIdAndIsReadFalse(recipientId);
        return new UnreadCountResponse(recipientId, count);
    }

    @Transactional
    public NotificationResponse markAsRead(UUID id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Notification not found: " + id));
        notification.setRead(true);
        Notification saved = notificationRepository.save(notification);
        return NotificationResponse.from(saved);
    }

    @Transactional
    public void markAllAsRead(UUID recipientId) {
        notificationRepository.markAllAsReadForRecipient(recipientId);
    }

    @Transactional(readOnly = true)
    public Page<NotificationResponse> getAllLogs(Pageable pageable) {
        return notificationRepository.findAll(pageable)
                .map(NotificationResponse::from);
    }
}
