package com.library.loan.dto;

public class ReturnLoanRequest {
    private String notes;

    public ReturnLoanRequest() {}

    public ReturnLoanRequest(String notes) {
        this.notes = notes;
    }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
