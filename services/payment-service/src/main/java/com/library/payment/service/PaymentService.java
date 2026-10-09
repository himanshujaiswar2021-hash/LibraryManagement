package com.library.payment.service;

import com.library.payment.domain.Fine;
import com.library.payment.domain.FineStatus;
import com.library.payment.domain.PaymentMethod;
import com.library.payment.domain.PaymentTransaction;
import com.library.payment.domain.TransactionStatus;
import com.library.payment.dto.PaymentDto.*;
import com.library.payment.repository.FineRepository;
import com.library.payment.repository.PaymentTransactionRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
public class PaymentService {

    private static final Logger log = LoggerFactory.getLogger(PaymentService.class);

    private final FineRepository fineRepository;
    private final PaymentTransactionRepository transactionRepository;
    private final BigDecimal defaultDailyRate;
    private final BigDecimal maxFinePerLoan;
    private final String currency;

    public PaymentService(
            FineRepository fineRepository,
            PaymentTransactionRepository transactionRepository,
            @Value("${app.fine.daily-rate:1.00}") BigDecimal defaultDailyRate,
            @Value("${app.fine.max-fine-per-loan:50.00}") BigDecimal maxFinePerLoan,
            @Value("${app.fine.currency:USD}") String currency) {
        this.fineRepository = fineRepository;
        this.transactionRepository = transactionRepository;
        this.defaultDailyRate = defaultDailyRate;
        this.maxFinePerLoan = maxFinePerLoan;
        this.currency = currency;
    }

    public FineCalculationResponse calculateFine(CalculateFineRequest request) {
        BigDecimal rate = request.dailyRate() != null ? request.dailyRate() : defaultDailyRate;
        int days = Math.max(0, request.overdueDays());
        BigDecimal total = rate.multiply(BigDecimal.valueOf(days));
        if (total.compareTo(maxFinePerLoan) > 0) {
            total = maxFinePerLoan;
        }

        return new FineCalculationResponse(request.loanId(), days, rate, total, currency);
    }

    @Transactional
    public FineResponse createFineInvoice(CreateFineInvoiceRequest request) {
        log.info("Creating fine invoice for loan {}: ${}", request.loanNumber(), request.amount());

        Fine fine = new Fine(
                request.loanId(),
                request.loanNumber(),
                request.memberId(),
                request.memberName(),
                request.bookId(),
                request.bookTitle(),
                request.overdueDays(),
                request.amount(),
                request.notes()
        );

        Fine saved = fineRepository.save(fine);
        return FineResponse.from(saved);
    }

    @Transactional(readOnly = true)
    public List<FineResponse> getMemberFines(UUID memberId) {
        return fineRepository.findByMemberIdOrderByCreatedAtDesc(memberId)
                .stream()
                .map(FineResponse::from)
                .toList();
    }

    @Transactional
    public PaymentTransactionResponse processPayment(ProcessPaymentRequest request) {
        log.info("Processing fine payment of ${} for fine ID {}", request.amount(), request.fineId());

        Fine fine = fineRepository.findById(request.fineId())
                .orElseThrow(() -> new IllegalArgumentException("Fine not found: " + request.fineId()));

        if (fine.getStatus() == FineStatus.PAID) {
            throw new IllegalStateException("This fine is already fully paid.");
        }
        if (fine.getStatus() == FineStatus.WAIVED) {
            throw new IllegalStateException("This fine was waived and cannot be paid.");
        }

        BigDecimal newPaidAmount = fine.getPaidAmount().add(request.amount());
        fine.setPaidAmount(newPaidAmount);

        if (newPaidAmount.compareTo(fine.getAmount()) >= 0) {
            fine.setStatus(FineStatus.PAID);
            fine.setPaidAt(Instant.now());
        }

        fineRepository.save(fine);

        String ref = "TXN-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        PaymentTransaction transaction = new PaymentTransaction(
                ref,
                fine.getId(),
                request.memberId(),
                request.amount(),
                request.method(),
                request.processedBy() != null ? request.processedBy() : "System"
        );
        PaymentTransaction savedTxn = transactionRepository.save(transaction);

        log.info("Payment successful. Receipt: {}, Ref: {}", savedTxn.getReceiptNumber(), savedTxn.getTransactionReference());
        return PaymentTransactionResponse.from(savedTxn);
    }

    @Transactional
    public FineResponse waiveFine(UUID fineId, WaiveFineRequest request) {
        log.info("Waiving fine ID {} by {}", fineId, request.waivedBy());

        Fine fine = fineRepository.findById(fineId)
                .orElseThrow(() -> new IllegalArgumentException("Fine not found: " + fineId));

        fine.setStatus(FineStatus.WAIVED);
        fine.setWaivedAt(Instant.now());
        fine.setWaivedBy(request.waivedBy());
        fine.setNotes(fine.getNotes() != null ? fine.getNotes() + " | Waived: " + request.reason() : "Waived: " + request.reason());

        Fine saved = fineRepository.save(fine);
        return FineResponse.from(saved);
    }

    @Transactional(readOnly = true)
    public Page<PaymentTransactionResponse> getTransactions(Pageable pageable) {
        return transactionRepository.findAllByOrderByCreatedAtDesc(pageable)
                .map(PaymentTransactionResponse::from);
    }

    @Transactional(readOnly = true)
    public Page<FineResponse> getAllFines(Pageable pageable) {
        return fineRepository.findAll(pageable)
                .map(FineResponse::from);
    }

    @Transactional(readOnly = true)
    public PaymentStatsResponse getStats() {
        return new PaymentStatsResponse(
                fineRepository.sumTotalCollectedRevenue(),
                fineRepository.sumTotalOutstandingFines(),
                fineRepository.countByStatus(FineStatus.UNPAID),
                fineRepository.countByStatus(FineStatus.PAID),
                fineRepository.countByStatus(FineStatus.WAIVED)
        );
    }
}
