package com.library.book.dto;

import com.library.book.domain.BookStatus;
import jakarta.validation.constraints.NotNull;

public class BookStatusRequest {
    @NotNull(message = "Status is required")
    private BookStatus status;

    public BookStatusRequest() {}

    public BookStatusRequest(BookStatus status) {
        this.status = status;
    }

    public BookStatus getStatus() { return status; }
    public void setStatus(BookStatus status) { this.status = status; }
}
