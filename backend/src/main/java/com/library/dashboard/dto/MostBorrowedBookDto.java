package com.library.dashboard.dto;

import java.util.UUID;

public class MostBorrowedBookDto {
    private UUID bookId;
    private String title;
    private String isbn;
    private long borrowCount;

    public MostBorrowedBookDto() {}

    public MostBorrowedBookDto(UUID bookId, String title, String isbn, long borrowCount) {
        this.bookId = bookId;
        this.title = title;
        this.isbn = isbn;
        this.borrowCount = borrowCount;
    }

    public UUID getBookId() { return bookId; }
    public void setBookId(UUID bookId) { this.bookId = bookId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getIsbn() { return isbn; }
    public void setIsbn(String isbn) { this.isbn = isbn; }

    public long getBorrowCount() { return borrowCount; }
    public void setBorrowCount(long borrowCount) { this.borrowCount = borrowCount; }
}
