package com.library.dashboard.controller;

import com.library.common.dto.ApiResponse;
import com.library.dashboard.dto.DashboardStatsDto;
import com.library.dashboard.dto.MostBorrowedBookDto;
import com.library.dashboard.dto.OverdueMemberSummaryDto;
import com.library.dashboard.service.DashboardService;
import com.library.loan.dto.LoanResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/dashboard")
@Tag(name = "Dashboard", description = "Operational dashboards and aggregated library metrics")
@SecurityRequirement(name = "bearerAuth")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/stats")
    @PreAuthorize("hasAnyRole('ADMIN', 'LIBRARIAN')")
    @Operation(summary = "Get system statistics", description = "ADMIN / LIBRARIAN: Get summary of books, copies, members, active loans, and overdue counts")
    public ApiResponse<DashboardStatsDto> getStats() {
        return ApiResponse.success(dashboardService.getStatistics(), "Dashboard statistics retrieved successfully");
    }

    @GetMapping("/recent-activity")
    @PreAuthorize("hasAnyRole('ADMIN', 'LIBRARIAN')")
    @Operation(summary = "Get recent transactions", description = "ADMIN / LIBRARIAN: Recent loan and return transactions")
    public ApiResponse<List<LoanResponse>> getRecentActivity() {
        return ApiResponse.success(dashboardService.getRecentActivity(), "Recent activity retrieved successfully");
    }

    @GetMapping("/most-borrowed")
    @PreAuthorize("hasAnyRole('ADMIN', 'LIBRARIAN')")
    @Operation(summary = "Get top borrowed books", description = "ADMIN / LIBRARIAN: Top 5 most borrowed books")
    public ApiResponse<List<MostBorrowedBookDto>> getMostBorrowedBooks() {
        return ApiResponse.success(dashboardService.getMostBorrowedBooks(), "Most borrowed books retrieved successfully");
    }

    @GetMapping("/overdue-members")
    @PreAuthorize("hasAnyRole('ADMIN', 'LIBRARIAN')")
    @Operation(summary = "Get members with overdue loans", description = "ADMIN / LIBRARIAN: List of members with overdue loans for follow-up")
    public ApiResponse<List<OverdueMemberSummaryDto>> getOverdueMembers() {
        return ApiResponse.success(dashboardService.getOverdueMembers(), "Overdue members retrieved successfully");
    }
}
