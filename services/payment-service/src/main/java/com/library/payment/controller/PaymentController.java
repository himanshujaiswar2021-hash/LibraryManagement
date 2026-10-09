package com.library.payment.controller;

import com.library.payment.dto.PaymentDto.*;
import com.library.payment.service.PaymentService;
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
@RequestMapping("/api/v1/payments")
@Tag(name = "Payments & Fines", description = "Fine Invoicing, Payments & Financial Ledger APIs")
@CrossOrigin(origins = "*")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @PostMapping("/calculate")
    @Operation(summary = "Calculate overdue fine amount for given days")
    public ResponseEntity<Map<String, Object>> calculateFine(@Valid @RequestBody CalculateFineRequest request) {
        FineCalculationResponse response = paymentService.calculateFine(request);
        return ResponseEntity.ok(Map.of(
                "success", true,
                "data", response
        ));
    }

    @PostMapping("/fines")
    @Operation(summary = "Create an overdue fine invoice for a loan")
    public ResponseEntity<Map<String, Object>> createFineInvoice(@Valid @RequestBody CreateFineInvoiceRequest request) {
        FineResponse response = paymentService.createFineInvoice(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "success", true,
                "data", response
        ));
    }

    @GetMapping("/fines/member/{memberId}")
    @Operation(summary = "Get all fines for a specific member")
    public ResponseEntity<Map<String, Object>> getMemberFines(@PathVariable UUID memberId) {
        List<FineResponse> fines = paymentService.getMemberFines(memberId);
        return ResponseEntity.ok(Map.of(
                "success", true,
                "data", fines
        ));
    }

    @PostMapping("/fines/{fineId}/pay")
    @Operation(summary = "Process a fine payment transaction")
    public ResponseEntity<Map<String, Object>> processPayment(
            @PathVariable UUID fineId,
            @Valid @RequestBody ProcessPaymentRequest request) {
        PaymentTransactionResponse response = paymentService.processPayment(request);
        return ResponseEntity.ok(Map.of(
                "success", true,
                "data", response
        ));
    }

    @PostMapping("/fines/{fineId}/waive")
    @Operation(summary = "Waive an outstanding fine (Admin/Librarian)")
    public ResponseEntity<Map<String, Object>> waiveFine(
            @PathVariable UUID fineId,
            @Valid @RequestBody WaiveFineRequest request) {
        FineResponse response = paymentService.waiveFine(fineId, request);
        return ResponseEntity.ok(Map.of(
                "success", true,
                "data", response
        ));
    }

    @GetMapping("/transactions")
    @Operation(summary = "Get paginated financial transactions ledger")
    public ResponseEntity<Map<String, Object>> getTransactions(@PageableDefault(size = 20) Pageable pageable) {
        Page<PaymentTransactionResponse> transactions = paymentService.getTransactions(pageable);
        return ResponseEntity.ok(Map.of(
                "success", true,
                "data", transactions
        ));
    }

    @GetMapping("/fines")
    @Operation(summary = "Get all fines across the system (Staff/Admin)")
    public ResponseEntity<Map<String, Object>> getAllFines(@PageableDefault(size = 20) Pageable pageable) {
        Page<FineResponse> fines = paymentService.getAllFines(pageable);
        return ResponseEntity.ok(Map.of(
                "success", true,
                "data", fines
        ));
    }

    @GetMapping("/stats")
    @Operation(summary = "Get overall financial revenue and fine statistics")
    public ResponseEntity<Map<String, Object>> getStats() {
        PaymentStatsResponse stats = paymentService.getStats();
        return ResponseEntity.ok(Map.of(
                "success", true,
                "data", stats
        ));
    }
}
