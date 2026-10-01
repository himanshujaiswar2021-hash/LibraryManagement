package com.library.member.dto;

import com.library.member.domain.MemberStatus;
import jakarta.validation.constraints.NotNull;

public class MemberStatusRequest {
    @NotNull(message = "Status is required")
    private MemberStatus status;

    private String reason;

    public MemberStatusRequest() {}

    public MemberStatusRequest(MemberStatus status, String reason) {
        this.status = status;
        this.reason = reason;
    }

    public MemberStatus getStatus() { return status; }
    public void setStatus(MemberStatus status) { this.status = status; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
}
