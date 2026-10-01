package com.library.dashboard.dto;

import java.util.UUID;

public class OverdueMemberSummaryDto {
    private UUID memberId;
    private String membershipNumber;
    private String fullName;
    private String email;
    private long overdueLoansCount;

    public OverdueMemberSummaryDto() {}

    public OverdueMemberSummaryDto(UUID memberId, String membershipNumber, String fullName, String email, long overdueLoansCount) {
        this.memberId = memberId;
        this.membershipNumber = membershipNumber;
        this.fullName = fullName;
        this.email = email;
        this.overdueLoansCount = overdueLoansCount;
    }

    public UUID getMemberId() { return memberId; }
    public void setMemberId(UUID memberId) { this.memberId = memberId; }

    public String getMembershipNumber() { return membershipNumber; }
    public void setMembershipNumber(String membershipNumber) { this.membershipNumber = membershipNumber; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public long getOverdueLoansCount() { return overdueLoansCount; }
    public void setOverdueLoansCount(long overdueLoansCount) { this.overdueLoansCount = overdueLoansCount; }
}
