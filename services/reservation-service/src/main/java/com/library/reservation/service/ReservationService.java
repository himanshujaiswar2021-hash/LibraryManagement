package com.library.reservation.service;

import com.library.reservation.domain.Reservation;
import com.library.reservation.domain.ReservationStatus;
import com.library.reservation.dto.ReservationDto.CreateReservationRequest;
import com.library.reservation.dto.ReservationDto.ReservationResponse;
import com.library.reservation.dto.ReservationDto.ReservationStatsResponse;
import com.library.reservation.repository.ReservationRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
public class ReservationService {

    private static final Logger log = LoggerFactory.getLogger(ReservationService.class);
    private static final Duration PICKUP_HOLD_DURATION = Duration.ofHours(48);

    private final ReservationRepository reservationRepository;

    public ReservationService(ReservationRepository reservationRepository) {
        this.reservationRepository = reservationRepository;
    }

    @Transactional
    public ReservationResponse createReservation(CreateReservationRequest request) {
        log.info("Creating reservation for member {} on book {}", request.memberId(), request.bookId());

        boolean alreadyReserved = reservationRepository.existsByBookIdAndMemberIdAndStatusIn(
                request.bookId(),
                request.memberId(),
                List.of(ReservationStatus.PENDING, ReservationStatus.READY_FOR_PICKUP)
        );

        if (alreadyReserved) {
            throw new IllegalStateException("Member already has an active hold/reservation on this book.");
        }

        long queueCount = reservationRepository.countPendingReservationsForBook(request.bookId());

        Reservation reservation = new Reservation(
                request.bookId(),
                request.bookTitle(),
                request.bookIsbn(),
                request.memberId(),
                request.memberName(),
                request.memberEmail()
        );
        reservation.setQueuePosition((int) queueCount + 1);

        Reservation saved = reservationRepository.save(reservation);
        log.info("Reservation created with ID: {}, position: {}", saved.getId(), saved.getQueuePosition());

        return ReservationResponse.from(saved);
    }

    @Transactional(readOnly = true)
    public List<ReservationResponse> getBookWaitlist(UUID bookId) {
        return reservationRepository.findByBookIdAndStatusOrderByCreatedAtAsc(bookId, ReservationStatus.PENDING)
                .stream()
                .map(ReservationResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ReservationResponse> getMemberReservations(UUID memberId) {
        return reservationRepository.findByMemberIdOrderByCreatedAtDesc(memberId)
                .stream()
                .map(ReservationResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public Page<ReservationResponse> getMemberReservationsPaginated(UUID memberId, Pageable pageable) {
        return reservationRepository.findByMemberId(memberId, pageable)
                .map(ReservationResponse::from);
    }

    @Transactional
    public ReservationResponse markReadyForPickup(UUID reservationId) {
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new IllegalArgumentException("Reservation not found: " + reservationId));

        reservation.setStatus(ReservationStatus.READY_FOR_PICKUP);
        reservation.setReadyAt(Instant.now());
        reservation.setPickupDeadline(Instant.now().plus(PICKUP_HOLD_DURATION));
        reservation.setQueuePosition(0);

        Reservation saved = reservationRepository.save(reservation);
        log.info("Reservation {} marked READY_FOR_PICKUP until {}", saved.getId(), saved.getPickupDeadline());

        return ReservationResponse.from(saved);
    }

    @Transactional
    public ReservationResponse fulfillReservation(UUID reservationId) {
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new IllegalArgumentException("Reservation not found: " + reservationId));

        reservation.setStatus(ReservationStatus.FULFILLED);
        reservation.setFulfilledAt(Instant.now());
        reservation.setQueuePosition(0);

        Reservation saved = reservationRepository.save(reservation);
        recalculateQueuePositions(reservation.getBookId());

        return ReservationResponse.from(saved);
    }

    @Transactional
    public ReservationResponse cancelReservation(UUID reservationId) {
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new IllegalArgumentException("Reservation not found: " + reservationId));

        reservation.setStatus(ReservationStatus.CANCELLED);
        reservation.setCancelledAt(Instant.now());
        reservation.setQueuePosition(0);

        Reservation saved = reservationRepository.save(reservation);
        recalculateQueuePositions(reservation.getBookId());

        return ReservationResponse.from(saved);
    }

    @Transactional
    public void recalculateQueuePositions(UUID bookId) {
        List<Reservation> queue = reservationRepository.findPendingQueueForBook(bookId);
        int pos = 1;
        for (Reservation r : queue) {
            r.setQueuePosition(pos++);
            reservationRepository.save(r);
        }
    }

    @Transactional(readOnly = true)
    public ReservationStatsResponse getStats() {
        return new ReservationStatsResponse(
                reservationRepository.count(),
                reservationRepository.countByStatus(ReservationStatus.PENDING),
                reservationRepository.countByStatus(ReservationStatus.READY_FOR_PICKUP),
                reservationRepository.countByStatus(ReservationStatus.FULFILLED),
                reservationRepository.countByStatus(ReservationStatus.CANCELLED)
        );
    }

    @Transactional(readOnly = true)
    public Page<ReservationResponse> getAllReservations(Pageable pageable) {
        return reservationRepository.findAll(pageable)
                .map(ReservationResponse::from);
    }
}
