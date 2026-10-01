package com.library.loan.service;

import com.library.audit.service.AuditService;
import com.library.book.domain.Book;
import com.library.book.domain.BookStatus;
import com.library.book.repository.BookRepository;
import com.library.common.exception.BusinessRuleException;
import com.library.common.exception.ResourceNotFoundException;
import com.library.loan.domain.Loan;
import com.library.loan.domain.LoanStatus;
import com.library.loan.dto.IssueLoanRequest;
import com.library.loan.dto.LoanResponse;
import com.library.loan.dto.ReturnLoanRequest;
import com.library.loan.repository.LoanRepository;
import com.library.member.domain.Member;
import com.library.member.domain.MemberStatus;
import com.library.member.repository.MemberRepository;
import com.library.user.domain.User;
import com.library.user.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;

@Service
public class LoanService {

    private final LoanRepository loanRepository;
    private final BookRepository bookRepository;
    private final MemberRepository memberRepository;
    private final UserRepository userRepository;
    private final AuditService auditService;

    private final int defaultLoanDurationDays;
    private final int maxRenewals;
    private final int finePerDayCents;

    public LoanService(
            LoanRepository loanRepository,
            BookRepository bookRepository,
            MemberRepository memberRepository,
            UserRepository userRepository,
            AuditService auditService,
            @Value("${app.library.default-loan-duration-days:14}") int defaultLoanDurationDays,
            @Value("${app.library.max-renewals:2}") int maxRenewals,
            @Value("${app.library.fine-per-day-cents:50}") int finePerDayCents) {
        this.loanRepository = loanRepository;
        this.bookRepository = bookRepository;
        this.memberRepository = memberRepository;
        this.userRepository = userRepository;
        this.auditService = auditService;
        this.defaultLoanDurationDays = defaultLoanDurationDays;
        this.maxRenewals = maxRenewals;
        this.finePerDayCents = finePerDayCents;
    }

    @Transactional
    public LoanResponse issueBook(IssueLoanRequest request, UUID actorId, String actorUsername, String ipAddress) {
        // 1. Lock and verify book
        Book book = bookRepository.findByIdWithLock(request.getBookId())
                .orElseThrow(() -> new ResourceNotFoundException("BOOK_NOT_FOUND", "Book not found with id: " + request.getBookId()));

        if (book.getStatus() != BookStatus.ACTIVE) {
            throw new BusinessRuleException("BOOK_NOT_ACTIVE", "Cannot issue book with status: " + book.getStatus());
        }

        if (book.getAvailableCopies() <= 0) {
            throw new BusinessRuleException("BOOK_UNAVAILABLE", "No available copies remain for book: " + book.getTitle());
        }

        // 2. Verify member
        Member member = memberRepository.findById(request.getMemberId())
                .orElseThrow(() -> new ResourceNotFoundException("MEMBER_NOT_FOUND", "Member not found with id: " + request.getMemberId()));

        if (member.getStatus() != MemberStatus.ACTIVE) {
            throw new BusinessRuleException("MEMBER_INACTIVE", "Member is not active (current status: " + member.getStatus() + ")");
        }

        int activeLoans = loanRepository.countActiveLoansByMemberId(member.getId());
        if (activeLoans >= member.getMaxLoans()) {
            throw new BusinessRuleException("LOAN_LIMIT_EXCEEDED",
                    "Member has reached maximum active loan limit of " + member.getMaxLoans());
        }

        boolean alreadyBorrowed = loanRepository.existsByBookIdAndMemberIdAndStatusIn(
                book.getId(), member.getId(), List.of(LoanStatus.ISSUED, LoanStatus.OVERDUE));
        if (alreadyBorrowed) {
            throw new BusinessRuleException("DUPLICATE_ACTIVE_LOAN", "Member already has an active loan for this book");
        }

        // 3. User issuer
        User issuedBy = userRepository.findById(actorId)
                .orElseThrow(() -> new ResourceNotFoundException("USER_NOT_FOUND", "Issuer user not found"));

        // 4. Atomically decrement copies
        book.setAvailableCopies(book.getAvailableCopies() - 1);
        bookRepository.save(book);

        // 5. Create loan
        Instant now = Instant.now();
        Instant dueDate = request.getDueDate() != null ? request.getDueDate() : now.plus(defaultLoanDurationDays, ChronoUnit.DAYS);

        Loan loan = new Loan();
        loan.setLoanNumber("TXN-" + System.currentTimeMillis() + "-" + (int)(Math.random() * 900 + 100));
        loan.setBook(book);
        loan.setMember(member);
        loan.setIssuedBy(issuedBy);
        loan.setIssueDate(now);
        loan.setDueDate(dueDate);
        loan.setStatus(LoanStatus.ISSUED);
        loan.setNotes(request.getNotes());

        Loan saved = loanRepository.save(loan);

        auditService.recordEventAsync(actorId, actorUsername, "LOAN_ISSUED", "LOAN", saved.getId().toString(), ipAddress,
                "Issued book '" + book.getTitle() + "' to member '" + member.getFullName() + "' (Loan: " + saved.getLoanNumber() + ")");

        return LoanResponse.from(saved);
    }

    @Transactional
    public LoanResponse returnBook(UUID loanId, ReturnLoanRequest request, UUID actorId, String actorUsername, String ipAddress) {
        Loan loan = loanRepository.findById(loanId)
                .orElseThrow(() -> new ResourceNotFoundException("LOAN_NOT_FOUND", "Loan not found with id: " + loanId));

        if (loan.getStatus() != LoanStatus.ISSUED && loan.getStatus() != LoanStatus.OVERDUE) {
            throw new BusinessRuleException("INVALID_LOAN_STATUS", "Loan cannot be returned because current status is: " + loan.getStatus());
        }

        // Lock book and increment copy
        Book book = bookRepository.findByIdWithLock(loan.getBook().getId())
                .orElseThrow(() -> new ResourceNotFoundException("BOOK_NOT_FOUND", "Associated book not found"));

        book.setAvailableCopies(Math.min(book.getTotalCopies(), book.getAvailableCopies() + 1));
        bookRepository.save(book);

        User returnedBy = userRepository.findById(actorId)
                .orElseThrow(() -> new ResourceNotFoundException("USER_NOT_FOUND", "User not found"));

        Instant now = Instant.now();
        loan.setReturnDate(now);
        loan.setReturnedBy(returnedBy);
        loan.setStatus(LoanStatus.RETURNED);

        if (request != null && request.getNotes() != null && !request.getNotes().isBlank()) {
            loan.setNotes(loan.getNotes() != null ? loan.getNotes() + " | Return note: " + request.getNotes() : request.getNotes());
        }

        // Check overdue fines
        if (now.isAfter(loan.getDueDate())) {
            long daysOverdue = Duration.between(loan.getDueDate(), now).toDays();
            if (daysOverdue > 0) {
                BigDecimal fine = BigDecimal.valueOf((daysOverdue * finePerDayCents) / 100.0);
                loan.setFineAmount(fine);
            }
        }

        Loan saved = loanRepository.save(loan);

        auditService.recordEventAsync(actorId, actorUsername, "LOAN_RETURNED", "LOAN", saved.getId().toString(), ipAddress,
                "Returned book '" + book.getTitle() + "' from member '" + loan.getMember().getFullName() + "' (Fine: $" + saved.getFineAmount() + ")");

        return LoanResponse.from(saved);
    }

    @Transactional
    public LoanResponse renewLoan(UUID loanId, UUID actorId, String actorUsername, String ipAddress) {
        Loan loan = loanRepository.findById(loanId)
                .orElseThrow(() -> new ResourceNotFoundException("LOAN_NOT_FOUND", "Loan not found with id: " + loanId));

        if (loan.getStatus() != LoanStatus.ISSUED && loan.getStatus() != LoanStatus.OVERDUE) {
            throw new BusinessRuleException("INVALID_LOAN_STATUS", "Cannot renew loan in status: " + loan.getStatus());
        }

        if (loan.getRenewalCount() >= maxRenewals) {
            throw new BusinessRuleException("MAX_RENEWALS_REACHED", "Maximum renewals reached (" + maxRenewals + ")");
        }

        loan.setRenewalCount(loan.getRenewalCount() + 1);
        loan.setDueDate(loan.getDueDate().plus(defaultLoanDurationDays, ChronoUnit.DAYS));
        if (loan.getStatus() == LoanStatus.OVERDUE && loan.getDueDate().isAfter(Instant.now())) {
            loan.setStatus(LoanStatus.ISSUED);
        }

        Loan saved = loanRepository.save(loan);

        auditService.recordEventAsync(actorId, actorUsername, "LOAN_RENEWED", "LOAN", saved.getId().toString(), ipAddress,
                "Renewed loan '" + saved.getLoanNumber() + "' (Count: " + saved.getRenewalCount() + ")");

        return LoanResponse.from(saved);
    }

    @Transactional
    public LoanResponse markLost(UUID loanId, UUID actorId, String actorUsername, String ipAddress) {
        Loan loan = loanRepository.findById(loanId)
                .orElseThrow(() -> new ResourceNotFoundException("LOAN_NOT_FOUND", "Loan not found with id: " + loanId));

        if (loan.getStatus() != LoanStatus.ISSUED && loan.getStatus() != LoanStatus.OVERDUE) {
            throw new BusinessRuleException("INVALID_LOAN_STATUS", "Cannot mark as lost in status: " + loan.getStatus());
        }

        // Lock book and decrement total copies (permanent inventory loss)
        Book book = bookRepository.findByIdWithLock(loan.getBook().getId())
                .orElseThrow(() -> new ResourceNotFoundException("BOOK_NOT_FOUND", "Associated book not found"));

        book.setTotalCopies(Math.max(0, book.getTotalCopies() - 1));
        bookRepository.save(book);

        loan.setStatus(LoanStatus.LOST);
        // Apply standard lost item replacement fee ($25.00)
        loan.setFineAmount(loan.getFineAmount().add(BigDecimal.valueOf(25.00)));

        Loan saved = loanRepository.save(loan);

        auditService.recordEventAsync(actorId, actorUsername, "LOAN_LOST", "LOAN", saved.getId().toString(), ipAddress,
                "Marked book as lost for loan '" + saved.getLoanNumber() + "'");

        return LoanResponse.from(saved);
    }

    @Transactional
    public LoanResponse cancelLoan(UUID loanId, UUID actorId, String actorUsername, String ipAddress) {
        Loan loan = loanRepository.findById(loanId)
                .orElseThrow(() -> new ResourceNotFoundException("LOAN_NOT_FOUND", "Loan not found with id: " + loanId));

        if (loan.getStatus() == LoanStatus.ISSUED || loan.getStatus() == LoanStatus.OVERDUE) {
            // Restore copy
            Book book = bookRepository.findByIdWithLock(loan.getBook().getId())
                    .orElseThrow(() -> new ResourceNotFoundException("BOOK_NOT_FOUND", "Book not found"));
            book.setAvailableCopies(Math.min(book.getTotalCopies(), book.getAvailableCopies() + 1));
            bookRepository.save(book);
        }

        loan.setStatus(LoanStatus.CANCELLED);
        Loan saved = loanRepository.save(loan);

        auditService.recordEventAsync(actorId, actorUsername, "LOAN_CANCELLED", "LOAN", saved.getId().toString(), ipAddress,
                "Cancelled loan '" + saved.getLoanNumber() + "'");

        return LoanResponse.from(saved);
    }

    @Transactional(readOnly = true)
    public Page<LoanResponse> searchLoans(LoanStatus status, UUID memberId, UUID bookId, Boolean overdueOnly, Pageable pageable) {
        return loanRepository.searchLoans(status, memberId, bookId, overdueOnly, Instant.now(), pageable)
                .map(LoanResponse::from);
    }

    @Transactional(readOnly = true)
    public Page<LoanResponse> getOverdueLoans(Pageable pageable) {
        return loanRepository.findOverdueLoans(Instant.now(), pageable)
                .map(LoanResponse::from);
    }

    @Transactional(readOnly = true)
    public LoanResponse getLoanById(UUID id) {
        Loan loan = loanRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("LOAN_NOT_FOUND", "Loan not found with id: " + id));
        return LoanResponse.from(loan);
    }

    @Transactional(readOnly = true)
    public Page<LoanResponse> getLoanHistoryByMember(UUID memberId, Pageable pageable) {
        return loanRepository.findLoanHistoryByMemberId(memberId, pageable)
                .map(LoanResponse::from);
    }

    @Transactional(readOnly = true)
    public List<LoanResponse> getActiveLoansByMember(UUID memberId) {
        return loanRepository.findActiveLoansByMemberId(memberId).stream()
                .map(LoanResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public Page<LoanResponse> getLoanHistoryByBook(UUID bookId, Pageable pageable) {
        return loanRepository.findLoanHistoryByBookId(bookId, pageable)
                .map(LoanResponse::from);
    }
}
