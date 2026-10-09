package com.library.payment.repository;

import com.library.payment.domain.PaymentTransaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PaymentTransactionRepository extends JpaRepository<PaymentTransaction, UUID> {

    List<PaymentTransaction> findByMemberIdOrderByCreatedAtDesc(UUID memberId);

    List<PaymentTransaction> findByFineIdOrderByCreatedAtDesc(UUID fineId);

    Page<PaymentTransaction> findAllByOrderByCreatedAtDesc(Pageable pageable);
}
