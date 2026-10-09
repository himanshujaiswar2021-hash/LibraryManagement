package com.library.payment;

import com.library.payment.domain.Fine;
import com.library.payment.domain.FineStatus;
import com.library.payment.domain.PaymentMethod;
import com.library.payment.domain.PaymentTransaction;
import com.library.payment.dto.PaymentDto.*;
import com.library.payment.repository.FineRepository;
import com.library.payment.repository.PaymentTransactionRepository;
import com.library.payment.service.PaymentService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PaymentServiceTest {

    @Mock
    private FineRepository fineRepository;

    @Mock
    private PaymentTransactionRepository transactionRepository;

    private PaymentService paymentService;

    @BeforeEach
    void setUp() {
        paymentService = new PaymentService(
                fineRepository,
                transactionRepository,
                BigDecimal.valueOf(1.00),
                BigDecimal.valueOf(50.00),
                "USD"
        );
    }

    @Test
    @DisplayName("Should accurately calculate overdue fine amount")
    void shouldCalculateFine() {
        UUID loanId = UUID.randomUUID();
        CalculateFineRequest request = new CalculateFineRequest(loanId, 5, BigDecimal.valueOf(1.50));

        FineCalculationResponse response = paymentService.calculateFine(request);

        assertThat(response.overdueDays()).isEqualTo(5);
        assertThat(response.totalFineAmount()).isEqualByComparingTo(BigDecimal.valueOf(7.50));
    }

    @Test
    @DisplayName("Should process payment and mark fine as PAID when fully settled")
    void shouldProcessFullPayment() {
        UUID fineId = UUID.randomUUID();
        UUID memberId = UUID.randomUUID();

        Fine fine = new Fine(
                UUID.randomUUID(), "TXN-001", memberId, "Alice",
                UUID.randomUUID(), "Clean Code", 4, BigDecimal.valueOf(4.00), "Late return"
        );
        fine.setId(fineId);

        when(fineRepository.findById(fineId)).thenReturn(Optional.of(fine));
        when(fineRepository.save(any(Fine.class))).thenReturn(fine);
        when(transactionRepository.save(any(PaymentTransaction.class))).thenAnswer(i -> i.getArgument(0));

        ProcessPaymentRequest request = new ProcessPaymentRequest(
                fineId, memberId, BigDecimal.valueOf(4.00), PaymentMethod.CREDIT_CARD, "StaffAdmin"
        );

        PaymentTransactionResponse response = paymentService.processPayment(request);

        assertThat(response).isNotNull();
        assertThat(response.amount()).isEqualByComparingTo(BigDecimal.valueOf(4.00));
        assertThat(fine.getStatus()).isEqualTo(FineStatus.PAID);
        assertThat(fine.getPaidAt()).isNotNull();
    }
}
