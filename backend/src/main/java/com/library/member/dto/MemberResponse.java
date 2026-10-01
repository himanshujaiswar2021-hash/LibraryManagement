package com.library.member.dto;

import com.library.member.domain.Member;
import com.library.member.domain.MemberStatus;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public class MemberResponse {
    private UUID id;
    private String membershipNumber;
    private String firstName;
    private String lastName;
    private String fullName;
    private String email;
    private String phone;
    private String address;
    private MemberStatus status;
    private int maxLoans;
    private int activeLoansCount;
    private LocalDate registrationDate;
    private Instant createdAt;
    private Instant updatedAt;

    public MemberResponse() {}

    public static MemberResponse from(Member member, int activeLoansCount) {
        MemberResponse res = new MemberResponse();
        res.setId(member.getId());
        res.setMembershipNumber(member.getMembershipNumber());
        res.setFirstName(member.getFirstName());
        res.setLastName(member.getLastName());
        res.setFullName(member.getFullName());
        res.setEmail(member.getEmail());
        res.setPhone(member.getPhone());
        res.setAddress(member.getAddress());
        res.setStatus(member.getStatus());
        res.setMaxLoans(member.getMaxLoans());
        res.setActiveLoansCount(activeLoansCount);
        res.setRegistrationDate(member.getRegistrationDate());
        res.setCreatedAt(member.getCreatedAt());
        res.setUpdatedAt(member.getUpdatedAt());
        return res;
    }

    public static MemberResponse from(Member member) {
        return from(member, 0);
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getMembershipNumber() { return membershipNumber; }
    public void setMembershipNumber(String membershipNumber) { this.membershipNumber = membershipNumber; }

    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }

    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public MemberStatus getStatus() { return status; }
    public void setStatus(MemberStatus status) { this.status = status; }

    public int getMaxLoans() { return maxLoans; }
    public void setMaxLoans(int maxLoans) { this.maxLoans = maxLoans; }

    public int getActiveLoansCount() { return activeLoansCount; }
    public void setActiveLoansCount(int activeLoansCount) { this.activeLoansCount = activeLoansCount; }

    public LocalDate getRegistrationDate() { return registrationDate; }
    public void setRegistrationDate(LocalDate registrationDate) { this.registrationDate = registrationDate; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
