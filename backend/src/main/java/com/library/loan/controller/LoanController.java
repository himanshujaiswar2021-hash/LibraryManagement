package com.library.loan.controller;

import com.library.auth.security.UserPrincipal;
import com.library.common.dto.ApiResponse;
import com.library.common.dto.PagedResponse;
import com.library.common.exception.UnauthorizedException;
import com.library.loan.domain.LoanStatus;
import com.library.loan.dto.IssueLoanRequest;
import com.library.loan.dto.LoanResponse;
import com.library.loan.dto.ReturnLoanRequest;
import com.library.loan.service.LoanService;
import com.library.user.domain.UserRole;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/loans")
@Tag(name = "Loans & Transactions", description = "Book issue, return, renewal, and loan lifecycle management")
@SecurityRequirement(name = "bearerAuth")
public class LoanController {

    private final LoanService loanService;

    public LoanController(LoanService loanService) {
        this.loanService = loanService;
    }

    @PostMapping("/issue")
    @PreAuthorize("hasAnyRole('ADMIN', 'LIBRARIAN')")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Issue a book", description = "ADMIN / LIBRARIAN: Check out a book copy to an active member with concurrency safety")
    public ApiResponse<LoanResponse> issueBook(
            @Valid @RequestBody IssueLoanRequest request,
            @AuthenticationPrincipal Object principal,
            HttpServletRequest httpRequest) {
        UUID actorId = (principal instanceof UserPrincipal up) ? up.getId() : UUID.randomUUID();
        String actorUsername = (principal instanceof UserPrincipal up) ? up.getUsername() : (principal != null ? principal.toString() : "system");
        LoanResponse response = loanService.issueBook(request, actorId, actorUsername, httpRequest.getRemoteAddr());
        return ApiResponse.success(response, "Book issued successfully");
    }

    @PostMapping("/{id}/return")
    @PreAuthorize("hasAnyRole('ADMIN', 'LIBRARIAN')")
    @Operation(summary = "Return a book", description = "ADMIN / LIBRARIAN: Process returned book copy and calculate overdue fine if applicable")
    public ApiResponse<LoanResponse> returnBook(
            @PathVariable UUID id,
            @RequestBody(required = false) ReturnLoanRequest request,
            @AuthenticationPrincipal Object principal,
            HttpServletRequest httpRequest) {
        UUID actorId = (principal instanceof UserPrincipal up) ? up.getId() : UUID.randomUUID();
        String actorUsername = (principal instanceof UserPrincipal up) ? up.getUsername() : (principal != null ? principal.toString() : "system");
        LoanResponse response = loanService.returnBook(id, request, actorId, actorUsername, httpRequest.getRemoteAddr());
        return ApiResponse.success(response, "Book returned successfully");
    }

    @PostMapping("/{id}/renew")
    @PreAuthorize("hasAnyRole('ADMIN', 'LIBRARIAN')")
    @Operation(summary = "Renew a loan", description = "ADMIN / LIBRARIAN: Extend loan duration (max 2 renewals)")
    public ApiResponse<LoanResponse> renewLoan(
            @PathVariable UUID id,
            @AuthenticationPrincipal Object principal,
            HttpServletRequest httpRequest) {
        UUID actorId = (principal instanceof UserPrincipal up) ? up.getId() : UUID.randomUUID();
        String actorUsername = (principal instanceof UserPrincipal up) ? up.getUsername() : (principal != null ? principal.toString() : "system");
        LoanResponse response = loanService.renewLoan(id, actorId, actorUsername, httpRequest.getRemoteAddr());
        return ApiResponse.success(response, "Loan renewed successfully");
    }

    @PostMapping("/{id}/lost")
    @PreAuthorize("hasAnyRole('ADMIN', 'LIBRARIAN')")
    @Operation(summary = "Mark loan as lost", description = "ADMIN / LIBRARIAN: Record book as lost, adjust catalog inventory, apply replacement fee")
    public ApiResponse<LoanResponse> markLost(
            @PathVariable UUID id,
            @AuthenticationPrincipal Object principal,
            HttpServletRequest httpRequest) {
        UUID actorId = (principal instanceof UserPrincipal up) ? up.getId() : UUID.randomUUID();
        String actorUsername = (principal instanceof UserPrincipal up) ? up.getUsername() : (principal != null ? principal.toString() : "system");
        LoanResponse response = loanService.markLost(id, actorId, actorUsername, httpRequest.getRemoteAddr());
        return ApiResponse.success(response, "Loan marked as lost");
    }

    @PostMapping("/{id}/cancel")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Cancel a loan", description = "ADMIN only: Cancel loan issued in error and restore book inventory copy")
    public ApiResponse<LoanResponse> cancelLoan(
            @PathVariable UUID id,
            @AuthenticationPrincipal Object principal,
            HttpServletRequest httpRequest) {
        UUID actorId = (principal instanceof UserPrincipal up) ? up.getId() : UUID.randomUUID();
        String actorUsername = (principal instanceof UserPrincipal up) ? up.getUsername() : (principal != null ? principal.toString() : "system");
        LoanResponse response = loanService.cancelLoan(id, actorId, actorUsername, httpRequest.getRemoteAddr());
        return ApiResponse.success(response, "Loan cancelled successfully");
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'LIBRARIAN')")
    @Operation(summary = "Search all loans", description = "ADMIN / LIBRARIAN: Paginated list of loans with filters")
    public ApiResponse<PagedResponse<LoanResponse>> searchLoans(
            @RequestParam(required = false) LoanStatus status,
            @RequestParam(required = false) UUID memberId,
            @RequestParam(required = false) UUID bookId,
            @RequestParam(required = false) Boolean overdueOnly,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        Page<LoanResponse> page = loanService.searchLoans(status, memberId, bookId, overdueOnly, pageable);
        return ApiResponse.success(PagedResponse.from(page), "Loans retrieved successfully");
    }

    @GetMapping("/overdue")
    @PreAuthorize("hasAnyRole('ADMIN', 'LIBRARIAN')")
    @Operation(summary = "Get overdue loans", description = "ADMIN / LIBRARIAN: List all loans past due date")
    public ApiResponse<PagedResponse<LoanResponse>> getOverdueLoans(
            @PageableDefault(size = 20, sort = "dueDate", direction = Sort.Direction.ASC) Pageable pageable) {
        Page<LoanResponse> page = loanService.getOverdueLoans(pageable);
        return ApiResponse.success(PagedResponse.from(page), "Overdue loans retrieved successfully");
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get loan by ID", description = "Get details of specific loan transaction")
    public ApiResponse<LoanResponse> getLoanById(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserPrincipal principal) {
        LoanResponse loan = loanService.getLoanById(id);
        if (principal.getRole() == UserRole.MEMBER && loan.getMember() != null) {
            if (!principal.getEmail().equalsIgnoreCase(loan.getMember().getEmail())) {
                throw new UnauthorizedException("FORBIDDEN", "You can only view your own loan details");
            }
        }
        return ApiResponse.success(loan);
    }
}
