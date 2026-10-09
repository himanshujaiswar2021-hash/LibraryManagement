package com.library.reservation;

import com.library.reservation.domain.Reservation;
import com.library.reservation.domain.ReservationStatus;
import com.library.reservation.dto.ReservationDto.CreateReservationRequest;
import com.library.reservation.dto.ReservationDto.ReservationResponse;
import com.library.reservation.repository.ReservationRepository;
import com.library.reservation.service.ReservationService;
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
class ReservationServiceTest {

    @Mock
    private ReservationRepository reservationRepository;

    private ReservationService reservationService;

    @BeforeEach
    void setUp() {
        reservationService = new ReservationService(reservationRepository);
    }

    @Test
    @DisplayName("Should create reservation and assign queue position")
    void shouldCreateReservation() {
        UUID bookId = UUID.randomUUID();
        UUID memberId = UUID.randomUUID();
        CreateReservationRequest request = new CreateReservationRequest(
                bookId, "Clean Code", "978-0132350884",
                memberId, "Alice Reader", "alice@example.com"
        );

        Reservation saved = new Reservation(bookId, "Clean Code", "978-0132350884", memberId, "Alice Reader", "alice@example.com");
        saved.setId(UUID.randomUUID());
        saved.setQueuePosition(1);

        when(reservationRepository.existsByBookIdAndMemberIdAndStatusIn(any(), any(), any())).thenReturn(false);
        when(reservationRepository.countPendingReservationsForBook(bookId)).thenReturn(0L);
        when(reservationRepository.save(any(Reservation.class))).thenReturn(saved);

        ReservationResponse response = reservationService.createReservation(request);

        assertThat(response).isNotNull();
        assertThat(response.bookTitle()).isEqualTo("Clean Code");
        assertThat(response.queuePosition()).isEqualTo(1);
        assertThat(response.status()).isEqualTo(ReservationStatus.PENDING);
    }

    @Test
    @DisplayName("Should mark reservation as ready for pickup")
    void shouldMarkReadyForPickup() {
        UUID resId = UUID.randomUUID();
        Reservation reservation = new Reservation(UUID.randomUUID(), "DDD", "978-0321125217", UUID.randomUUID(), "Bob", "bob@example.com");
        reservation.setId(resId);

        when(reservationRepository.findById(resId)).thenReturn(Optional.of(reservation));
        when(reservationRepository.save(any(Reservation.class))).thenReturn(reservation);

        ReservationResponse response = reservationService.markReadyForPickup(resId);

        assertThat(response.status()).isEqualTo(ReservationStatus.READY_FOR_PICKUP);
        assertThat(response.pickupDeadline()).isNotNull();
    }
}
