package com.library.loan.repository;

import com.library.loan.domain.Loan;
import com.library.loan.domain.LoanStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface LoanRepository extends JpaRepository<Loan, UUID> {

    Optional<Loan> findByLoanNumber(String loanNumber);

    @Query("SELECT l FROM Loan l WHERE l.member.id = :memberId AND l.status IN ('ISSUED', 'OVERDUE')")
    List<Loan> findActiveLoansByMemberId(@Param("memberId") UUID memberId);

    @Query("SELECT COUNT(l) FROM Loan l WHERE l.member.id = :memberId AND l.status IN ('ISSUED', 'OVERDUE')")
    int countActiveLoansByMemberId(@Param("memberId") UUID memberId);

    @Query("SELECT l FROM Loan l WHERE l.member.id = :memberId ORDER BY l.createdAt DESC")
    Page<Loan> findLoanHistoryByMemberId(@Param("memberId") UUID memberId, Pageable pageable);

    @Query("SELECT l FROM Loan l WHERE l.book.id = :bookId ORDER BY l.createdAt DESC")
    Page<Loan> findLoanHistoryByBookId(@Param("bookId") UUID bookId, Pageable pageable);

    boolean existsByBookIdAndMemberIdAndStatusIn(UUID bookId, UUID memberId, Collection<LoanStatus> statuses);

    @Query("SELECT l FROM Loan l " +
           "LEFT JOIN FETCH l.book b " +
           "LEFT JOIN FETCH l.member m " +
           "WHERE (:status IS NULL OR l.status = :status) " +
           "AND (:memberId IS NULL OR l.member.id = :memberId) " +
           "AND (:bookId IS NULL OR l.book.id = :bookId) " +
           "AND (:overdueOnly IS NULL OR (:overdueOnly = TRUE AND l.dueDate < :now AND l.status IN ('ISSUED', 'OVERDUE')))")
    Page<Loan> searchLoans(
            @Param("status") LoanStatus status,
            @Param("memberId") UUID memberId,
            @Param("bookId") UUID bookId,
            @Param("overdueOnly") Boolean overdueOnly,
            @Param("now") Instant now,
            Pageable pageable);

    @Query("SELECT l FROM Loan l " +
           "LEFT JOIN FETCH l.book " +
           "LEFT JOIN FETCH l.member " +
           "WHERE l.dueDate < :now AND l.status IN ('ISSUED', 'OVERDUE')")
    Page<Loan> findOverdueLoans(@Param("now") Instant now, Pageable pageable);

    @Query("SELECT COUNT(l) FROM Loan l WHERE l.status = 'ISSUED' OR l.status = 'OVERDUE'")
    long countCurrentlyIssuedLoans();

    @Query("SELECT COUNT(l) FROM Loan l WHERE l.dueDate < :now AND (l.status = 'ISSUED' OR l.status = 'OVERDUE')")
    long countOverdueLoans(@Param("now") Instant now);

    @Query("SELECT l.book.id, l.book.title, l.book.isbn, COUNT(l) as borrowCount " +
           "FROM Loan l GROUP BY l.book.id, l.book.title, l.book.isbn " +
           "ORDER BY borrowCount DESC")
    List<Object[]> findMostBorrowedBooks(Pageable pageable);

    @Query("SELECT DISTINCT l.member.id, l.member.membershipNumber, l.member.firstName, l.member.lastName, l.member.email, COUNT(l) " +
           "FROM Loan l WHERE l.dueDate < :now AND (l.status = 'ISSUED' OR l.status = 'OVERDUE') " +
           "GROUP BY l.member.id, l.member.membershipNumber, l.member.firstName, l.member.lastName, l.member.email")
    List<Object[]> findMembersWithOverdueLoans(@Param("now") Instant now);

    @Query("SELECT l FROM Loan l ORDER BY l.createdAt DESC")
    List<Loan> findRecentLoans(Pageable pageable);
}
