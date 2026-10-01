package com.library.loan.dto;

import com.library.book.dto.BookResponse;
import com.library.loan.domain.Loan;
import com.library.loan.domain.LoanStatus;
import com.library.member.dto.MemberResponse;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public class LoanResponse {
    private UUID id;
    private String loanNumber;
    private BookResponse book;
    private MemberResponse member;
    private UUID issuedById;
    private String issuedByUsername;
    private UUID returnedById;
    private String returnedByUsername;
    private Instant issueDate;
    private Instant dueDate;
    private Instant returnDate;
    private LoanStatus status;
    private int renewalCount;
    private BigDecimal fineAmount;
    private String notes;
    private boolean overdue;
    private long daysOverdue;
    private Instant createdAt;
    private Instant updatedAt;

    public LoanResponse() {}

    public static LoanResponse from(Loan loan) {
        LoanResponse res = new LoanResponse();
        res.setId(loan.getId());
        res.setLoanNumber(loan.getLoanNumber());
        if (loan.getBook() != null) {
            res.setBook(BookResponse.from(loan.getBook()));
        }
        if (loan.getMember() != null) {
            res.setMember(MemberResponse.from(loan.getMember()));
        }
        if (loan.getIssuedBy() != null) {
            res.setIssuedById(loan.getIssuedBy().getId());
            res.setIssuedByUsername(loan.getIssuedBy().getUsername());
        }
        if (loan.getReturnedBy() != null) {
            res.setReturnedById(loan.getReturnedBy().getId());
            res.setReturnedByUsername(loan.getReturnedBy().getUsername());
        }
        res.setIssueDate(loan.getIssueDate());
        res.setDueDate(loan.getDueDate());
        res.setReturnDate(loan.getReturnDate());
        res.setStatus(loan.getStatus());
        res.setRenewalCount(loan.getRenewalCount());
        res.setFineAmount(loan.getFineAmount());
        res.setNotes(loan.getNotes());
        res.setCreatedAt(loan.getCreatedAt());
        res.setUpdatedAt(loan.getUpdatedAt());

        boolean isCurrentlyOverdue = (loan.getStatus() == LoanStatus.ISSUED || loan.getStatus() == LoanStatus.OVERDUE)
                && loan.getDueDate().isBefore(Instant.now());
        res.setOverdue(isCurrentlyOverdue);

        if (isCurrentlyOverdue) {
            long diffSeconds = Instant.now().getEpochSecond() - loan.getDueDate().getEpochSecond();
            res.setDaysOverdue(Math.max(1, diffSeconds / 86400));
        } else {
            res.setDaysOverdue(0);
        }

        return res;
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getLoanNumber() { return loanNumber; }
    public void setLoanNumber(String loanNumber) { this.loanNumber = loanNumber; }

    public BookResponse getBook() { return book; }
    public void setBook(BookResponse book) { this.book = book; }

    public MemberResponse getMember() { return member; }
    public void setMember(MemberResponse member) { this.member = member; }

    public UUID getIssuedById() { return issuedById; }
    public void setIssuedById(UUID issuedById) { this.issuedById = issuedById; }

    public String getIssuedByUsername() { return issuedByUsername; }
    public void setIssuedByUsername(String issuedByUsername) { this.issuedByUsername = issuedByUsername; }

    public UUID getReturnedById() { return returnedById; }
    public void setReturnedById(UUID returnedById) { this.returnedById = returnedById; }

    public String getReturnedByUsername() { return returnedByUsername; }
    public void setReturnedByUsername(String returnedByUsername) { this.returnedByUsername = returnedByUsername; }

    public Instant getIssueDate() { return issueDate; }
    public void setIssueDate(Instant issueDate) { this.issueDate = issueDate; }

    public Instant getDueDate() { return dueDate; }
    public void setDueDate(Instant dueDate) { this.dueDate = dueDate; }

    public Instant getReturnDate() { return returnDate; }
    public void setReturnDate(Instant returnDate) { this.returnDate = returnDate; }

    public LoanStatus getStatus() { return status; }
    public void setStatus(LoanStatus status) { this.status = status; }

    public int getRenewalCount() { return renewalCount; }
    public void setRenewalCount(int renewalCount) { this.renewalCount = renewalCount; }

    public BigDecimal getFineAmount() { return fineAmount; }
    public void setFineAmount(BigDecimal fineAmount) { this.fineAmount = fineAmount; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public boolean isOverdue() { return overdue; }
    public void setOverdue(boolean overdue) { this.overdue = overdue; }

    public long getDaysOverdue() { return daysOverdue; }
    public void setDaysOverdue(long daysOverdue) { this.daysOverdue = daysOverdue; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
