package com.library.member.controller;

import com.library.auth.security.UserPrincipal;
import com.library.common.dto.ApiResponse;
import com.library.common.dto.PagedResponse;
import com.library.common.exception.UnauthorizedException;
import com.library.loan.dto.LoanResponse;
import com.library.loan.service.LoanService;
import com.library.member.domain.MemberStatus;
import com.library.member.dto.MemberRequest;
import com.library.member.dto.MemberResponse;
import com.library.member.dto.MemberStatusRequest;
import com.library.member.service.MemberService;
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

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/members")
@Tag(name = "Members", description = "Library member management endpoints")
@SecurityRequirement(name = "bearerAuth")
public class MemberController {

    private final MemberService memberService;
    private final LoanService loanService;

    public MemberController(MemberService memberService, LoanService loanService) {
        this.memberService = memberService;
        this.loanService = loanService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'LIBRARIAN')")
    @Operation(summary = "Search library members", description = "ADMIN / LIBRARIAN: Filter and paginate through registered members")
    public ApiResponse<PagedResponse<MemberResponse>> searchMembers(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) MemberStatus status,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {

        Page<MemberResponse> page = memberService.searchMembers(search, status, pageable);
        return ApiResponse.success(PagedResponse.from(page), "Members retrieved successfully");
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get member details", description = "ADMIN / LIBRARIAN or the member themselves")
    public ApiResponse<MemberResponse> getMemberById(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserPrincipal principal) {
        MemberResponse member = memberService.getMemberById(id);
        validateMemberAccess(principal, member.getEmail());
        return ApiResponse.success(member);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'LIBRARIAN')")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Register a member", description = "ADMIN / LIBRARIAN: Register a new patron")
    public ApiResponse<MemberResponse> createMember(
            @Valid @RequestBody MemberRequest request,
            @AuthenticationPrincipal UserPrincipal principal,
            HttpServletRequest httpRequest) {
        MemberResponse response = memberService.createMember(request, principal.getId(), principal.getUsername(), httpRequest.getRemoteAddr());
        return ApiResponse.success(response, "Member registered successfully");
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'LIBRARIAN')")
    @Operation(summary = "Update member profile", description = "ADMIN / LIBRARIAN: Update contact information and loan limits")
    public ApiResponse<MemberResponse> updateMember(
            @PathVariable UUID id,
            @Valid @RequestBody MemberRequest request,
            @AuthenticationPrincipal UserPrincipal principal,
            HttpServletRequest httpRequest) {
        MemberResponse response = memberService.updateMember(id, request, principal.getId(), principal.getUsername(), httpRequest.getRemoteAddr());
        return ApiResponse.success(response, "Member profile updated successfully");
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'LIBRARIAN')")
    @Operation(summary = "Change membership status", description = "ADMIN / LIBRARIAN: Set status to ACTIVE, SUSPENDED, or INACTIVE")
    public ApiResponse<MemberResponse> updateMemberStatus(
            @PathVariable UUID id,
            @Valid @RequestBody MemberStatusRequest request,
            @AuthenticationPrincipal UserPrincipal principal,
            HttpServletRequest httpRequest) {
        MemberResponse response = memberService.updateMemberStatus(id, request.getStatus(), request.getReason(), principal.getId(), principal.getUsername(), httpRequest.getRemoteAddr());
        return ApiResponse.success(response, "Member status updated successfully");
    }

    @GetMapping("/{id}/loans")
    @Operation(summary = "Get active loans for member", description = "ADMIN / LIBRARIAN or member viewing their own loans")
    public ApiResponse<List<LoanResponse>> getActiveLoans(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserPrincipal principal) {
        MemberResponse member = memberService.getMemberById(id);
        validateMemberAccess(principal, member.getEmail());
        return ApiResponse.success(loanService.getActiveLoansByMember(id));
    }

    @GetMapping("/{id}/loans/history")
    @Operation(summary = "Get loan history for member", description = "ADMIN / LIBRARIAN or member viewing their own history")
    public ApiResponse<PagedResponse<LoanResponse>> getLoanHistory(
            @PathVariable UUID id,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable,
            @AuthenticationPrincipal UserPrincipal principal) {
        MemberResponse member = memberService.getMemberById(id);
        validateMemberAccess(principal, member.getEmail());
        Page<LoanResponse> page = loanService.getLoanHistoryByMember(id, pageable);
        return ApiResponse.success(PagedResponse.from(page), "Member loan history retrieved successfully");
    }

    private void validateMemberAccess(UserPrincipal principal, String memberEmail) {
        if (principal.getRole() == UserRole.MEMBER) {
            if (!principal.getEmail().equalsIgnoreCase(memberEmail)) {
                throw new UnauthorizedException("FORBIDDEN", "You can only view your own member profile");
            }
        }
    }
}
