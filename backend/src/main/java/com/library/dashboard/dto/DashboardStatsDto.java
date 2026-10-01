package com.library.dashboard.dto;

public class DashboardStatsDto {
    private long totalBooks;
    private long totalCopies;
    private long totalAvailableCopies;
    private long currentlyIssuedBooks;
    private long overdueLoans;
    private long totalMembers;
    private long activeMembers;

    public DashboardStatsDto() {}

    public DashboardStatsDto(long totalBooks, long totalCopies, long totalAvailableCopies, long currentlyIssuedBooks, long overdueLoans, long totalMembers, long activeMembers) {
        this.totalBooks = totalBooks;
        this.totalCopies = totalCopies;
        this.totalAvailableCopies = totalAvailableCopies;
        this.currentlyIssuedBooks = currentlyIssuedBooks;
        this.overdueLoans = overdueLoans;
        this.totalMembers = totalMembers;
        this.activeMembers = activeMembers;
    }

    public long getTotalBooks() { return totalBooks; }
    public void setTotalBooks(long totalBooks) { this.totalBooks = totalBooks; }

    public long getTotalCopies() { return totalCopies; }
    public void setTotalCopies(long totalCopies) { this.totalCopies = totalCopies; }

    public long getTotalAvailableCopies() { return totalAvailableCopies; }
    public void setTotalAvailableCopies(long totalAvailableCopies) { this.totalAvailableCopies = totalAvailableCopies; }

    public long getCurrentlyIssuedBooks() { return currentlyIssuedBooks; }
    public void setCurrentlyIssuedBooks(long currentlyIssuedBooks) { this.currentlyIssuedBooks = currentlyIssuedBooks; }

    public long getOverdueLoans() { return overdueLoans; }
    public void setOverdueLoans(long overdueLoans) { this.overdueLoans = overdueLoans; }

    public long getTotalMembers() { return totalMembers; }
    public void setTotalMembers(long totalMembers) { this.totalMembers = totalMembers; }

    public long getActiveMembers() { return activeMembers; }
    public void setActiveMembers(long activeMembers) { this.activeMembers = activeMembers; }
}
