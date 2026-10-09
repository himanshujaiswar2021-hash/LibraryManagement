package com.library.notification.dto;

import com.library.notification.domain.DeliveryChannel;
import com.library.notification.domain.Notification;
import com.library.notification.domain.NotificationStatus;
import com.library.notification.domain.NotificationType;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.Instant;
import java.util.UUID;

public class NotificationDto {

    public record SendNotificationRequest(
            @NotNull(message = "Recipient ID is required") UUID recipientId,
            @NotBlank(message = "Recipient email is required") @Email String recipientEmail,
            String recipientPhone,
            @NotNull(message = "Notification type is required") NotificationType type,
            @NotNull(message = "Delivery channel is required") DeliveryChannel channel,
            @NotBlank(message = "Title is required") String title,
            @NotBlank(message = "Message body is required") String message
    ) {}

    public record NotificationResponse(
            UUID id,
            UUID recipientId,
            String recipientEmail,
            String recipientPhone,
            NotificationType type,
            DeliveryChannel channel,
            String title,
            String message,
            NotificationStatus status,
            boolean isRead,
            Instant readAt,
            Instant createdAt
    ) {
        public static NotificationResponse from(Notification n) {
            return new NotificationResponse(
                    n.getId(),
                    n.getRecipientId(),
                    n.getRecipientEmail(),
                    n.getRecipientPhone(),
                    n.getType(),
                    n.getChannel(),
                    n.getTitle(),
                    n.getMessage(),
                    n.getStatus(),
                    n.isRead(),
                    n.getReadAt(),
                    n.getCreatedAt()
            );
        }
    }

    public record UnreadCountResponse(
            UUID recipientId,
            long unreadCount
    ) {}
}
