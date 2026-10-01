package com.library.loan;

import com.library.book.domain.Book;
import com.library.book.domain.BookStatus;
import com.library.book.repository.BookRepository;
import com.library.common.exception.BusinessRuleException;
import com.library.loan.domain.LoanStatus;
import com.library.loan.dto.IssueLoanRequest;
import com.library.loan.dto.LoanResponse;
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
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@ActiveProfiles("test")
class LoanConcurrencyIntegrationTest {

    @Autowired
    private LoanService loanService;

    @Autowired
    private BookRepository bookRepository;

    @Autowired
    private MemberRepository memberRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private LoanRepository loanRepository;

    private Book singleCopyBook;
    private List<Member> testMembers;
    private User librarian;

    @BeforeEach
    void setUp() {
        loanRepository.deleteAll();
        bookRepository.deleteAll();
        memberRepository.deleteAll();
        userRepository.deleteAll();

        // 1. Create a user
        librarian = new User("concurrent_lib", "lib@test.local", "hash", "Concurrent Librarian", UserRole.LIBRARIAN);
        librarian = userRepository.save(librarian);

        // 2. Create a book with exactly 1 available copy
        singleCopyBook = new Book();
        singleCopyBook.setIsbn("978-CONCURRENT-1");
        singleCopyBook.setTitle("Concurrency in Practice");
        singleCopyBook.setTotalCopies(1);
        singleCopyBook.setAvailableCopies(1);
        singleCopyBook.setStatus(BookStatus.ACTIVE);
        singleCopyBook = bookRepository.save(singleCopyBook);

        // 3. Create 5 distinct members
        testMembers = new ArrayList<>();
        for (int i = 1; i <= 5; i++) {
            Member member = new Member();
            member.setMembershipNumber("MEM-CONC-" + i);
            member.setFirstName("Tester" + i);
            member.setLastName("Concurrent");
            member.setEmail("tester" + i + "@conc.local");
            member.setMaxLoans(5);
            member.setStatus(MemberStatus.ACTIVE);
            testMembers.add(memberRepository.save(member));
        }
    }

    @Test
    @DisplayName("Pessimistic locking prevents overselling: only 1 of 5 simultaneous issue requests succeeds")
    void shouldPreventConcurrentOverselling() throws InterruptedException {
        int threadCount = 5;
        ExecutorService executorService = Executors.newFixedThreadPool(threadCount);
        CountDownLatch startLatch = new CountDownLatch(1);
        CountDownLatch finishLatch = new CountDownLatch(threadCount);

        AtomicInteger successCount = new AtomicInteger(0);
        AtomicInteger failureCount = new AtomicInteger(0);

        for (int i = 0; i < threadCount; i++) {
            final int index = i;
            executorService.submit(() -> {
                try {
                    startLatch.await(); // Wait for simultaneous release
                    IssueLoanRequest request = new IssueLoanRequest(
                            singleCopyBook.getId(),
                            testMembers.get(index).getId(),
                            null,
                            "Concurrent checkout attempt " + index
                    );
                    LoanResponse response = loanService.issueBook(request, librarian.getId(), librarian.getUsername(), "127.0.0.1");
                    if (response != null && response.getStatus() == LoanStatus.ISSUED) {
                        successCount.incrementAndGet();
                    }
                } catch (BusinessRuleException ex) {
                    failureCount.incrementAndGet();
                } catch (Exception ex) {
                    failureCount.incrementAndGet();
                } finally {
                    finishLatch.countDown();
                }
            });
        }

        startLatch.countDown(); // Trigger all threads simultaneously
        boolean completed = finishLatch.await(10, TimeUnit.SECONDS);
        executorService.shutdown();

        assertThat(completed).isTrue();
        assertThat(successCount.get()).isEqualTo(1);
        assertThat(failureCount.get()).isEqualTo(4);

        // Verify database state: Available copies must be exactly 0, never negative
        Book updatedBook = bookRepository.findById(singleCopyBook.getId()).orElseThrow();
        assertThat(updatedBook.getAvailableCopies()).isEqualTo(0);
        assertThat(updatedBook.getTotalCopies()).isEqualTo(1);

        // Verify active loans in DB is exactly 1
        long activeLoanCount = loanRepository.countCurrentlyIssuedLoans();
        assertThat(activeLoanCount).isEqualTo(1);
    }
}
