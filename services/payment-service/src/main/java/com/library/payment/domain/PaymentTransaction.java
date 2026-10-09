package com.library.payment.domain;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "payment_transactions")
public class PaymentTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, unique = true)
    private String transactionReference;

    @Column(nullable = false)
    private UUID fineId;

    @Column(nullable = false)
    private UUID memberId;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaymentMethod method;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TransactionStatus status = TransactionStatus.SUCCESS;

    private String receiptNumber;
    private String processedBy;

    @Column(nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    public PaymentTransaction() {}

    public PaymentTransaction(String transactionReference, UUID fineId, UUID memberId,
                              BigDecimal amount, PaymentMethod method, String processedBy) {
        this.transactionReference = transactionReference;
        this.fineId = fineId;
        this.memberId = memberId;
        this.amount = amount;
        this.method = method;
        this.status = TransactionStatus.SUCCESS;
        this.receiptNumber = "REC-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        this.processedBy = processedBy;
        this.createdAt = Instant.now();
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getTransactionReference() { return transactionReference; }
    public void setTransactionReference(String transactionReference) { this.transactionReference = transactionReference; }

    public UUID getFineId() { return fineId; }
    public void setFineId(UUID fineId) { this.fineId = fineId; }

    public UUID getMemberId() { return memberId; }
    public void setMemberId(UUID memberId) { this.memberId = memberId; }

    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }

    public PaymentMethod getMethod() { return method; }
    public void setMethod(PaymentMethod method) { this.method = method; }

    public TransactionStatus getStatus() { return status; }
    public void setStatus(TransactionStatus status) { this.status = status; }

    public String getReceiptNumber() { return receiptNumber; }
    public void setReceiptNumber(String receiptNumber) { this.receiptNumber = receiptNumber; }

    public String getProcessedBy() { return processedBy; }
    public void setProcessedBy(String processedBy) { this.processedBy = processedBy; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
