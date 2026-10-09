package com.library.payment.repository;

import com.library.payment.domain.Fine;
import com.library.payment.domain.FineStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface FineRepository extends JpaRepository<Fine, UUID> {

    List<Fine> findByMemberIdOrderByCreatedAtDesc(UUID memberId);

    List<Fine> findByMemberIdAndStatus(UUID memberId, FineStatus status);

    Optional<Fine> findByLoanId(UUID loanId);

    @Query("SELECT COALESCE(SUM(f.amount - f.paidAmount), 0) FROM Fine f WHERE f.memberId = :memberId AND f.status = 'UNPAID'")
    BigDecimal calculateTotalUnpaidFinesForMember(@Param("memberId") UUID memberId);

    @Query("SELECT COALESCE(SUM(f.paidAmount), 0) FROM Fine f")
    BigDecimal sumTotalCollectedRevenue();

    @Query("SELECT COALESCE(SUM(f.amount - f.paidAmount), 0) FROM Fine f WHERE f.status = 'UNPAID'")
    BigDecimal sumTotalOutstandingFines();

    long countByStatus(FineStatus status);
}
