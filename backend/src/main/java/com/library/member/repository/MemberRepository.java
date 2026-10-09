package com.library.member.repository;

import com.library.member.domain.Member;
import com.library.member.domain.MemberStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface MemberRepository extends JpaRepository<Member, UUID> {
    Optional<Member> findByMembershipNumber(String membershipNumber);
    Optional<Member> findByEmailIgnoreCase(String email);
    boolean existsByMembershipNumber(String membershipNumber);
    boolean existsByEmailIgnoreCase(String email);

    @Query("SELECT m FROM Member m WHERE " +
           "(:status IS NULL OR m.status = :status) AND " +
           "(CAST(:search AS string) IS NULL OR " +
           " LOWER(m.membershipNumber) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%')) OR " +
           " LOWER(m.firstName) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%')) OR " +
           " LOWER(m.lastName) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%')) OR " +
           " LOWER(m.email) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%')) OR " +
           " LOWER(m.phone) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%')))")
    Page<Member> searchMembers(
            @Param("search") String search,
            @Param("status") MemberStatus status,
            Pageable pageable);

    @Query("SELECT COUNT(m) FROM Member m WHERE m.status = 'ACTIVE'")
    long countActiveMembers();

    @Query("SELECT COUNT(m) FROM Member m")
    long countTotalMembers();
}
