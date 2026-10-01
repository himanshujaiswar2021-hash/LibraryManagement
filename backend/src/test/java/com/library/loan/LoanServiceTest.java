package com.library.loan;

import com.library.audit.service.AuditService;
import com.library.book.domain.Book;
import com.library.book.domain.BookStatus;
import com.library.book.repository.BookRepository;
import com.library.common.exception.BusinessRuleException;
import com.library.loan.domain.Loan;
import com.library.loan.domain.LoanStatus;
import com.library.loan.dto.IssueLoanRequest;
import com.library.loan.dto.LoanResponse;
import com.library.loan.dto.ReturnLoanRequest;
import com.library.loan.repository.LoanRepository;
import com.library.loan.service.LoanService;
import com.library.member.domain.Member;
import com.library.member.domain.MemberStatus;
import com.library.member.repository.MemberRepository;
import com.library.user.domain.User;
import com.library.user.domain.UserRole;
import com.library.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Collections;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class LoanServiceTest {

    @Mock
    private LoanRepository loanRepository;

    @Mock
    private BookRepository bookRepository;

    @Mock
    private MemberRepository memberRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private AuditService auditService;

    private LoanService loanService;

    private Book testBook;
    private Member testMember;
    private User testUser;
    private UUID actorId;

    @BeforeEach
    void setUp() {
        loanService = new LoanService(
                loanRepository,
                bookRepository,
                memberRepository,
                userRepository,
                auditService,
                14,
                2,
                50
        );

        actorId = UUID.randomUUID();

        testBook = new Book();
        testBook.setId(UUID.randomUUID());
        testBook.setIsbn("978-0132350884");
        testBook.setTitle("Clean Code");
        testBook.setTotalCopies(5);
        testBook.setAvailableCopies(5);
        testBook.setStatus(BookStatus.ACTIVE);

        testMember = new Member();
        testMember.setId(UUID.randomUUID());
        testMember.setMembershipNumber("MEM-2026-0001");
        testMember.setFirstName("Alice");
        testMember.setLastName("Reader");
        testMember.setEmail("alice@library.local");
        testMember.setMaxLoans(5);
        testMember.setStatus(MemberStatus.ACTIVE);

        testUser = new User("librarian", "lib@library.local", "hashed", "Senior Librarian", UserRole.LIBRARIAN);
        testUser.setId(actorId);
    }

    @Test
    @DisplayName("Should successfully issue a book when all criteria are satisfied")
    void shouldIssueBookSuccessfully() {
        when(bookRepository.findByIdWithLock(testBook.getId())).thenReturn(Optional.of(testBook));
        when(memberRepository.findById(testMember.getId())).thenReturn(Optional.of(testMember));
        when(userRepository.findById(actorId)).thenReturn(Optional.of(testUser));
        when(loanRepository.countActiveLoansByMemberId(testMember.getId())).thenReturn(0);
        when(loanRepository.existsByBookIdAndMemberIdAndStatusIn(eq(testBook.getId()), eq(testMember.getId()), any()))
                .thenReturn(false);

        when(loanRepository.save(any(Loan.class))).thenAnswer(invocation -> {
            Loan loan = invocation.getArgument(0);
            loan.setId(UUID.randomUUID());
            loan.setCreatedAt(Instant.now());
            loan.setUpdatedAt(Instant.now());
            return loan;
        });

        IssueLoanRequest request = new IssueLoanRequest(testBook.getId(), testMember.getId(), null, "First checkout");
        LoanResponse response = loanService.issueBook(request, actorId, "librarian", "127.0.0.1");

        assertThat(response).isNotNull();
        assertThat(response.getStatus()).isEqualTo(LoanStatus.ISSUED);
        assertThat(testBook.getAvailableCopies()).isEqualTo(4);

        verify(bookRepository, times(1)).save(testBook);
        verify(loanRepository, times(1)).save(any(Loan.class));
    }

    @Test
    @DisplayName("Should throw BusinessRuleException when no available copies remain")
    void shouldThrowExceptionWhenNoCopiesAvailable() {
        testBook.setAvailableCopies(0);
        when(bookRepository.findByIdWithLock(testBook.getId())).thenReturn(Optional.of(testBook));

        IssueLoanRequest request = new IssueLoanRequest(testBook.getId(), testMember.getId(), null, null);

        assertThatThrownBy(() -> loanService.issueBook(request, actorId, "librarian", "127.0.0.1"))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("No available copies remain");

        verify(loanRepository, never()).save(any(Loan.class));
    }

    @Test
    @DisplayName("Should throw BusinessRuleException when member is suspended")
    void shouldThrowExceptionWhenMemberIsSuspended() {
        testMember.setStatus(MemberStatus.SUSPENDED);
        when(bookRepository.findByIdWithLock(testBook.getId())).thenReturn(Optional.of(testBook));
        when(memberRepository.findById(testMember.getId())).thenReturn(Optional.of(testMember));

        IssueLoanRequest request = new IssueLoanRequest(testBook.getId(), testMember.getId(), null, null);

        assertThatThrownBy(() -> loanService.issueBook(request, actorId, "librarian", "127.0.0.1"))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("Member is not active");
    }

    @Test
    @DisplayName("Should throw BusinessRuleException when member reaches maximum loan limit")
    void shouldThrowExceptionWhenLoanLimitExceeded() {
        when(bookRepository.findByIdWithLock(testBook.getId())).thenReturn(Optional.of(testBook));
        when(memberRepository.findById(testMember.getId())).thenReturn(Optional.of(testMember));
        when(loanRepository.countActiveLoansByMemberId(testMember.getId())).thenReturn(5);

        IssueLoanRequest request = new IssueLoanRequest(testBook.getId(), testMember.getId(), null, null);

        assertThatThrownBy(() -> loanService.issueBook(request, actorId, "librarian", "127.0.0.1"))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("maximum active loan limit");
    }

    @Test
    @DisplayName("Should successfully return a book on time and increment copy count")
    void shouldReturnBookSuccessfullyOnTime() {
        testBook.setAvailableCopies(4);
        Loan loan = new Loan();
        loan.setId(UUID.randomUUID());
        loan.setLoanNumber("TXN-001");
        loan.setBook(testBook);
        loan.setMember(testMember);
        loan.setIssuedBy(testUser);
        loan.setIssueDate(Instant.now().minus(5, ChronoUnit.DAYS));
        loan.setDueDate(Instant.now().plus(9, ChronoUnit.DAYS));
        loan.setStatus(LoanStatus.ISSUED);
        loan.setFineAmount(BigDecimal.ZERO);

        when(loanRepository.findById(loan.getId())).thenReturn(Optional.of(loan));
        when(bookRepository.findByIdWithLock(testBook.getId())).thenReturn(Optional.of(testBook));
        when(userRepository.findById(actorId)).thenReturn(Optional.of(testUser));
        when(loanRepository.save(any(Loan.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ReturnLoanRequest returnRequest = new ReturnLoanRequest("Returned in great condition");
        LoanResponse response = loanService.returnBook(loan.getId(), returnRequest, actorId, "librarian", "127.0.0.1");

        assertThat(response.getStatus()).isEqualTo(LoanStatus.RETURNED);
        assertThat(testBook.getAvailableCopies()).isEqualTo(5);
        assertThat(response.getFineAmount()).isEqualByComparingTo(BigDecimal.ZERO);
    }
}
