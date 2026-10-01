package com.library.dashboard.service;

import com.library.book.repository.BookRepository;
import com.library.dashboard.dto.DashboardStatsDto;
import com.library.dashboard.dto.MostBorrowedBookDto;
import com.library.dashboard.dto.OverdueMemberSummaryDto;
import com.library.loan.dto.LoanResponse;
import com.library.loan.repository.LoanRepository;
import com.library.member.repository.MemberRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class DashboardService {

    private final BookRepository bookRepository;
    private final MemberRepository memberRepository;
    private final LoanRepository loanRepository;

    public DashboardService(
            BookRepository bookRepository,
            MemberRepository memberRepository,
            LoanRepository loanRepository) {
        this.bookRepository = bookRepository;
        this.memberRepository = memberRepository;
        this.loanRepository = loanRepository;
    }

    @Transactional(readOnly = true)
    public DashboardStatsDto getStatistics() {
        long totalBooks = bookRepository.countActiveBooks();
        long totalCopies = bookRepository.sumTotalCopies();
        long totalAvailableCopies = bookRepository.sumAvailableCopies();
        long activeMembers = memberRepository.countActiveMembers();
        long totalMembers = memberRepository.countTotalMembers();
        long issuedLoans = loanRepository.countCurrentlyIssuedLoans();
        long overdueLoans = loanRepository.countOverdueLoans(Instant.now());

        return new DashboardStatsDto(
                totalBooks,
                totalCopies,
                totalAvailableCopies,
                issuedLoans,
                overdueLoans,
                totalMembers,
                activeMembers
        );
    }

    @Transactional(readOnly = true)
    public List<LoanResponse> getRecentActivity() {
        return loanRepository.findRecentLoans(PageRequest.of(0, 10)).stream()
                .map(LoanResponse::from)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<MostBorrowedBookDto> getMostBorrowedBooks() {
        return loanRepository.findMostBorrowedBooks(PageRequest.of(0, 5)).stream()
                .map(row -> new MostBorrowedBookDto(
                        (UUID) row[0],
                        (String) row[1],
                        (String) row[2],
                        ((Number) row[3]).longValue()
                ))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<OverdueMemberSummaryDto> getOverdueMembers() {
        return loanRepository.findMembersWithOverdueLoans(Instant.now()).stream()
                .map(row -> new OverdueMemberSummaryDto(
                        (UUID) row[0],
                        (String) row[1],
                        (String) row[2] + " " + (String) row[3],
                        (String) row[4],
                        ((Number) row[5]).longValue()
                ))
                .collect(Collectors.toList());
    }
}
