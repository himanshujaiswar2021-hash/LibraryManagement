package com.library.reservation.dto;

import com.library.reservation.domain.Reservation;
import com.library.reservation.domain.ReservationStatus;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.Instant;
import java.util.UUID;

public class ReservationDto {

    public record CreateReservationRequest(
            @NotNull(message = "Book ID is required") UUID bookId,
            @NotBlank(message = "Book title is required") String bookTitle,
            @NotBlank(message = "Book ISBN is required") String bookIsbn,
            @NotNull(message = "Member ID is required") UUID memberId,
            @NotBlank(message = "Member name is required") String memberName,
            @NotBlank(message = "Member email is required") @Email String memberEmail
    ) {}

    public record ReservationResponse(
            UUID id,
            UUID bookId,
            String bookTitle,
            String bookIsbn,
            UUID memberId,
            String memberName,
            String memberEmail,
            ReservationStatus status,
            int queuePosition,
            Instant readyAt,
            Instant pickupDeadline,
            Instant fulfilledAt,
            Instant cancelledAt,
            Instant createdAt
    ) {
        public static ReservationResponse from(Reservation r) {
            return new ReservationResponse(
                    r.getId(),
                    r.getBookId(),
                    r.getBookTitle(),
                    r.getBookIsbn(),
                    r.getMemberId(),
                    r.getMemberName(),
                    r.getMemberEmail(),
                    r.getStatus(),
                    r.getQueuePosition(),
                    r.getReadyAt(),
                    r.getPickupDeadline(),
                    r.getFulfilledAt(),
                    r.getCancelledAt(),
                    r.getCreatedAt()
            );
        }
    }

    public record ReservationStatsResponse(
            long totalReservations,
            long pendingReservations,
            long readyForPickup,
            long fulfilledReservations,
            long cancelledReservations
    ) {}
}
