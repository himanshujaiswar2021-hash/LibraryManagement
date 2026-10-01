package com.library.member.service;

import com.library.audit.service.AuditService;
import com.library.common.exception.ConflictException;
import com.library.common.exception.ResourceNotFoundException;
import com.library.loan.repository.LoanRepository;
import com.library.member.domain.Member;
import com.library.member.domain.MemberStatus;
import com.library.member.dto.MemberRequest;
import com.library.member.dto.MemberResponse;
import com.library.member.repository.MemberRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.Year;
import java.util.UUID;

@Service
public class MemberService {

    private final MemberRepository memberRepository;
    private final LoanRepository loanRepository;
    private final AuditService auditService;

    public MemberService(
            MemberRepository memberRepository,
            LoanRepository loanRepository,
            AuditService auditService) {
        this.memberRepository = memberRepository;
        this.loanRepository = loanRepository;
        this.auditService = auditService;
    }

    @Transactional(readOnly = true)
    public Page<MemberResponse> searchMembers(String search, MemberStatus status, Pageable pageable) {
        return memberRepository.searchMembers(search, status, pageable)
                .map(member -> {
                    int activeLoans = loanRepository.countActiveLoansByMemberId(member.getId());
                    return MemberResponse.from(member, activeLoans);
                });
    }

    @Transactional(readOnly = true)
    public MemberResponse getMemberById(UUID id) {
        Member member = memberRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("MEMBER_NOT_FOUND", "Member not found with id: " + id));
        int activeLoans = loanRepository.countActiveLoansByMemberId(member.getId());
        return MemberResponse.from(member, activeLoans);
    }

    @Transactional(readOnly = true)
    public MemberResponse getMemberByEmail(String email) {
        Member member = memberRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new ResourceNotFoundException("MEMBER_NOT_FOUND", "Member not found with email: " + email));
        int activeLoans = loanRepository.countActiveLoansByMemberId(member.getId());
        return MemberResponse.from(member, activeLoans);
    }

    @Transactional
    public MemberResponse createMember(MemberRequest request, UUID actorId, String actorUsername, String ipAddress) {
        if (memberRepository.existsByEmailIgnoreCase(request.getEmail().trim())) {
            throw new ConflictException("EMAIL_ALREADY_EXISTS", "A member with email " + request.getEmail() + " already exists");
        }

        long count = memberRepository.countTotalMembers() + 1;
        String membershipNumber = String.format("MEM-%d-%04d", Year.now().getValue(), count);

        Member member = new Member();
        member.setMembershipNumber(membershipNumber);
        member.setFirstName(request.getFirstName().trim());
        member.setLastName(request.getLastName().trim());
        member.setEmail(request.getEmail().toLowerCase().trim());
        member.setPhone(request.getPhone());
        member.setAddress(request.getAddress());
        member.setMaxLoans(request.getMaxLoans() > 0 ? request.getMaxLoans() : 5);
        member.setStatus(MemberStatus.ACTIVE);
        member.setRegistrationDate(LocalDate.now());

        Member saved = memberRepository.save(member);

        auditService.recordEventAsync(actorId, actorUsername, "MEMBER_REGISTERED", "MEMBER", saved.getId().toString(), ipAddress,
                "Registered member: " + saved.getFullName() + " (" + saved.getMembershipNumber() + ")");

        return MemberResponse.from(saved, 0);
    }

    @Transactional
    public MemberResponse updateMember(UUID id, MemberRequest request, UUID actorId, String actorUsername, String ipAddress) {
        Member member = memberRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("MEMBER_NOT_FOUND", "Member not found with id: " + id));

        if (!member.getEmail().equalsIgnoreCase(request.getEmail().trim()) && memberRepository.existsByEmailIgnoreCase(request.getEmail().trim())) {
            throw new ConflictException("EMAIL_ALREADY_EXISTS", "A member with email " + request.getEmail() + " already exists");
        }

        member.setFirstName(request.getFirstName().trim());
        member.setLastName(request.getLastName().trim());
        member.setEmail(request.getEmail().toLowerCase().trim());
        member.setPhone(request.getPhone());
        member.setAddress(request.getAddress());
        member.setMaxLoans(request.getMaxLoans());

        Member updated = memberRepository.save(member);
        int activeLoans = loanRepository.countActiveLoansByMemberId(updated.getId());

        auditService.recordEventAsync(actorId, actorUsername, "MEMBER_UPDATED", "MEMBER", updated.getId().toString(), ipAddress,
                "Updated member: " + updated.getFullName() + " (" + updated.getMembershipNumber() + ")");

        return MemberResponse.from(updated, activeLoans);
    }

    @Transactional
    public MemberResponse updateMemberStatus(UUID id, MemberStatus status, String reason, UUID actorId, String actorUsername, String ipAddress) {
        Member member = memberRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("MEMBER_NOT_FOUND", "Member not found with id: " + id));

        member.setStatus(status);
        Member updated = memberRepository.save(member);
        int activeLoans = loanRepository.countActiveLoansByMemberId(updated.getId());

        auditService.recordEventAsync(actorId, actorUsername, "MEMBER_STATUS_CHANGED", "MEMBER", updated.getId().toString(), ipAddress,
                "Changed member status to " + status + (reason != null ? " Reason: " + reason : ""));

        return MemberResponse.from(updated, activeLoans);
    }
}
