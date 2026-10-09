package com.library.payment.dto;

import com.library.payment.domain.Fine;
import com.library.payment.domain.FineStatus;
import com.library.payment.domain.PaymentMethod;
import com.library.payment.domain.PaymentTransaction;
import com.library.payment.domain.TransactionStatus;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public class PaymentDto {

    public record CalculateFineRequest(
            @NotNull UUID loanId,
            @NotNull Integer overdueDays,
            BigDecimal dailyRate
    ) {}

    public record FineCalculationResponse(
            UUID loanId,
            int overdueDays,
            BigDecimal dailyRate,
            BigDecimal totalFineAmount,
            String currency
    ) {}

    public record CreateFineInvoiceRequest(
            @NotNull UUID loanId,
            @NotBlank String loanNumber,
            @NotNull UUID memberId,
            @NotBlank String memberName,
            @NotNull UUID bookId,
            @NotBlank String bookTitle,
            @NotNull Integer overdueDays,
            @NotNull @DecimalMin("0.01") BigDecimal amount,
            String notes
    ) {}

    public record ProcessPaymentRequest(
            @NotNull UUID fineId,
            @NotNull UUID memberId,
            @NotNull @DecimalMin("0.01") BigDecimal amount,
            @NotNull PaymentMethod method,
            String processedBy
    ) {}

    public record WaiveFineRequest(
            @NotBlank String reason,
            @NotBlank String waivedBy
    ) {}

    public record FineResponse(
            UUID id,
            UUID loanId,
            String loanNumber,
            UUID memberId,
            String memberName,
            UUID bookId,
            String bookTitle,
            int overdueDays,
            BigDecimal amount,
            BigDecimal paidAmount,
            BigDecimal remainingAmount,
            FineStatus status,
            String notes,
            Instant paidAt,
            Instant waivedAt,
            String waivedBy,
            Instant createdAt
    ) {
        public static FineResponse from(Fine f) {
            BigDecimal remaining = f.getAmount().subtract(f.getPaidAmount());
            return new FineResponse(
                    f.getId(),
                    f.getLoanId(),
                    f.getLoanNumber(),
                    f.getMemberId(),
                    f.getMemberName(),
                    f.getBookId(),
                    f.getBookTitle(),
                    f.getOverdueDays(),
                    f.getAmount(),
                    f.getPaidAmount(),
                    remaining.compareTo(BigDecimal.ZERO) < 0 ? BigDecimal.ZERO : remaining,
                    f.getStatus(),
                    f.getNotes(),
                    f.getPaidAt(),
                    f.getWaivedAt(),
                    f.getWaivedBy(),
                    f.getCreatedAt()
            );
        }
    }

    public record PaymentTransactionResponse(
            UUID id,
            String transactionReference,
            UUID fineId,
            UUID memberId,
            BigDecimal amount,
            PaymentMethod method,
            TransactionStatus status,
            String receiptNumber,
            String processedBy,
            Instant createdAt
    ) {
        public static PaymentTransactionResponse from(PaymentTransaction t) {
            return new PaymentTransactionResponse(
                    t.getId(),
                    t.getTransactionReference(),
                    t.getFineId(),
                    t.getMemberId(),
                    t.getAmount(),
                    t.getMethod(),
                    t.getStatus(),
                    t.getReceiptNumber(),
                    t.getProcessedBy(),
                    t.getCreatedAt()
            );
        }
    }

    public record PaymentStatsResponse(
            BigDecimal totalRevenueCollected,
            BigDecimal totalOutstandingFines,
            long unpaidFinesCount,
            long paidFinesCount,
            long waivedFinesCount
    ) {}
}
