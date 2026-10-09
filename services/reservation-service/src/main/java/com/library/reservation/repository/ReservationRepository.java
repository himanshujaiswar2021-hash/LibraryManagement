package com.library.reservation.repository;

import com.library.reservation.domain.Reservation;
import com.library.reservation.domain.ReservationStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ReservationRepository extends JpaRepository<Reservation, UUID> {

    List<Reservation> findByBookIdAndStatusOrderByCreatedAtAsc(UUID bookId, ReservationStatus status);

    List<Reservation> findByMemberIdOrderByCreatedAtDesc(UUID memberId);

    Page<Reservation> findByMemberId(UUID memberId, Pageable pageable);

    boolean existsByBookIdAndMemberIdAndStatusIn(UUID bookId, UUID memberId, List<ReservationStatus> statuses);

    @Query("SELECT COUNT(r) FROM Reservation r WHERE r.bookId = :bookId AND r.status = 'PENDING'")
    long countPendingReservationsForBook(@Param("bookId") UUID bookId);

    @Query("SELECT r FROM Reservation r WHERE r.bookId = :bookId AND r.status = 'PENDING' ORDER BY r.createdAt ASC")
    List<Reservation> findPendingQueueForBook(@Param("bookId") UUID bookId);

    long countByStatus(ReservationStatus status);
}
