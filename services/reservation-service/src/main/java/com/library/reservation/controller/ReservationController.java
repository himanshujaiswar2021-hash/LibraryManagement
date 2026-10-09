package com.library.reservation.controller;

import com.library.reservation.dto.ReservationDto.CreateReservationRequest;
import com.library.reservation.dto.ReservationDto.ReservationResponse;
import com.library.reservation.dto.ReservationDto.ReservationStatsResponse;
import com.library.reservation.service.ReservationService;
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
@RequestMapping("/api/v1/reservations")
@Tag(name = "Reservations", description = "Book Reservation & Hold Queue APIs")
@CrossOrigin(origins = "*")
public class ReservationController {

    private final ReservationService reservationService;

    public ReservationController(ReservationService reservationService) {
        this.reservationService = reservationService;
    }

    @PostMapping
    @Operation(summary = "Place a new book reservation / hold")
    public ResponseEntity<Map<String, Object>> createReservation(@Valid @RequestBody CreateReservationRequest request) {
        ReservationResponse response = reservationService.createReservation(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "success", true,
                "data", response
        ));
    }

    @GetMapping("/book/{bookId}")
    @Operation(summary = "Get current waiting list for a specific book")
    public ResponseEntity<Map<String, Object>> getBookWaitlist(@PathVariable UUID bookId) {
        List<ReservationResponse> waitlist = reservationService.getBookWaitlist(bookId);
        return ResponseEntity.ok(Map.of(
                "success", true,
                "data", waitlist
        ));
    }

    @GetMapping("/member/{memberId}")
    @Operation(summary = "Get all reservations for a specific member")
    public ResponseEntity<Map<String, Object>> getMemberReservations(
            @PathVariable UUID memberId,
            @PageableDefault(size = 20) Pageable pageable) {
        Page<ReservationResponse> page = reservationService.getMemberReservationsPaginated(memberId, pageable);
        return ResponseEntity.ok(Map.of(
                "success", true,
                "data", page
        ));
    }

    @PatchMapping("/{id}/ready")
    @Operation(summary = "Mark a reservation as ready for pickup (Hold activated)")
    public ResponseEntity<Map<String, Object>> markReadyForPickup(@PathVariable UUID id) {
        ReservationResponse response = reservationService.markReadyForPickup(id);
        return ResponseEntity.ok(Map.of(
                "success", true,
                "data", response
        ));
    }

    @PatchMapping("/{id}/fulfill")
    @Operation(summary = "Fulfill a reservation upon book checkout")
    public ResponseEntity<Map<String, Object>> fulfillReservation(@PathVariable UUID id) {
        ReservationResponse response = reservationService.fulfillReservation(id);
        return ResponseEntity.ok(Map.of(
                "success", true,
                "data", response
        ));
    }

    @PatchMapping("/{id}/cancel")
    @Operation(summary = "Cancel a reservation")
    public ResponseEntity<Map<String, Object>> cancelReservation(@PathVariable UUID id) {
        ReservationResponse response = reservationService.cancelReservation(id);
        return ResponseEntity.ok(Map.of(
                "success", true,
                "data", response
        ));
    }

    @GetMapping("/stats")
    @Operation(summary = "Get overall reservation queue statistics")
    public ResponseEntity<Map<String, Object>> getStats() {
        ReservationStatsResponse stats = reservationService.getStats();
        return ResponseEntity.ok(Map.of(
                "success", true,
                "data", stats
        ));
    }

    @GetMapping
    @Operation(summary = "List all reservations across the system (Staff/Admin)")
    public ResponseEntity<Map<String, Object>> getAllReservations(@PageableDefault(size = 20) Pageable pageable) {
        Page<ReservationResponse> page = reservationService.getAllReservations(pageable);
        return ResponseEntity.ok(Map.of(
                "success", true,
                "data", page
        ));
    }
}
