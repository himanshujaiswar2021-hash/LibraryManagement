package com.library.notification;

import com.library.notification.domain.DeliveryChannel;
import com.library.notification.domain.Notification;
import com.library.notification.domain.NotificationStatus;
import com.library.notification.domain.NotificationType;
import com.library.notification.dto.NotificationDto.NotificationResponse;
import com.library.notification.dto.NotificationDto.SendNotificationRequest;
import com.library.notification.repository.NotificationRepository;
import com.library.notification.service.NotificationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class NotificationServiceTest {

    @Mock
    private NotificationRepository notificationRepository;

    private NotificationService notificationService;

    @BeforeEach
    void setUp() {
        notificationService = new NotificationService(notificationRepository);
    }

    @Test
    @DisplayName("Should dispatch and save notification successfully")
    void shouldSendNotification() {
        UUID recipientId = UUID.randomUUID();
        SendNotificationRequest request = new SendNotificationRequest(
                recipientId,
                "user@example.com",
                "+1-555-0199",
                NotificationType.LOAN_ISSUED,
                DeliveryChannel.IN_APP,
                "Book Issued",
                "You have checked out Clean Code"
        );

        Notification saved = new Notification(
                request.recipientId(), request.recipientEmail(), request.recipientPhone(),
                request.type(), request.channel(), request.title(), request.message()
        );
        saved.setId(UUID.randomUUID());
        saved.setStatus(NotificationStatus.DELIVERED);

        when(notificationRepository.save(any(Notification.class))).thenReturn(saved);

        NotificationResponse response = notificationService.sendNotification(request);

        assertThat(response).isNotNull();
        assertThat(response.recipientEmail()).isEqualTo("user@example.com");
        assertThat(response.title()).isEqualTo("Book Issued");
        assertThat(response.status()).isEqualTo(NotificationStatus.DELIVERED);
        verify(notificationRepository, times(1)).save(any(Notification.class));
    }

    @Test
    @DisplayName("Should mark notification as read")
    void shouldMarkAsRead() {
        UUID id = UUID.randomUUID();
        Notification notification = new Notification(
                UUID.randomUUID(), "user@example.com", null,
                NotificationType.OVERDUE_ALERT, DeliveryChannel.IN_APP,
                "Overdue Notice", "Please return book"
        );
        notification.setId(id);

        when(notificationRepository.findById(id)).thenReturn(Optional.of(notification));
        when(notificationRepository.save(any(Notification.class))).thenReturn(notification);

        NotificationResponse response = notificationService.markAsRead(id);

        assertThat(response.isRead()).isTrue();
        verify(notificationRepository, times(1)).save(notification);
    }
}
