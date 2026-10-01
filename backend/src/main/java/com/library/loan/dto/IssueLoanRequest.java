package com.library.loan.dto;

import jakarta.validation.constraints.NotNull;

import java.time.Instant;
import java.util.UUID;

public class IssueLoanRequest {

    @NotNull(message = "Book ID is required")
    private UUID bookId;

    @NotNull(message = "Member ID is required")
    private UUID memberId;

    private Instant dueDate;

    private String notes;

    public IssueLoanRequest() {}

    public IssueLoanRequest(UUID bookId, UUID memberId, Instant dueDate, String notes) {
        this.bookId = bookId;
        this.memberId = memberId;
        this.dueDate = dueDate;
        this.notes = notes;
    }

    public UUID getBookId() { return bookId; }
    public void setBookId(UUID bookId) { this.bookId = bookId; }

    public UUID getMemberId() { return memberId; }
    public void setMemberId(UUID memberId) { this.memberId = memberId; }

    public Instant getDueDate() { return dueDate; }
    public void setDueDate(Instant dueDate) { this.dueDate = dueDate; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
