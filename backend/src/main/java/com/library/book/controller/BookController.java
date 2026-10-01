package com.library.book.controller;

import com.library.auth.security.UserPrincipal;
import com.library.book.domain.BookStatus;
import com.library.book.dto.BookRequest;
import com.library.book.dto.BookResponse;
import com.library.book.dto.BookStatusRequest;
import com.library.book.service.BookService;
import com.library.common.dto.ApiResponse;
import com.library.common.dto.PagedResponse;
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
@RequestMapping("/api/v1/books")
@Tag(name = "Books", description = "Book catalog management and search endpoints")
@SecurityRequirement(name = "bearerAuth")
public class BookController {

    private final BookService bookService;

    public BookController(BookService bookService) {
        this.bookService = bookService;
    }

    @GetMapping
    @Operation(summary = "Search books catalog", description = "Search, filter, paginate and sort library catalog")
    public ApiResponse<PagedResponse<BookResponse>> searchBooks(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) UUID categoryId,
            @RequestParam(required = false) UUID authorId,
            @RequestParam(required = false) Boolean availableOnly,
            @RequestParam(required = false) BookStatus status,
            @PageableDefault(size = 20, sort = "title", direction = Sort.Direction.ASC) Pageable pageable) {

        Page<BookResponse> page = bookService.searchBooks(search, categoryId, authorId, availableOnly, status, pageable);
        return ApiResponse.success(PagedResponse.from(page), "Books retrieved successfully");
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get book by ID", description = "Get full details of a specific catalog entry")
    public ApiResponse<BookResponse> getBookById(@PathVariable UUID id) {
        return ApiResponse.success(bookService.getBookById(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'LIBRARIAN')")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Add a book", description = "ADMIN / LIBRARIAN: Create a new book record")
    public ApiResponse<BookResponse> createBook(
            @Valid @RequestBody BookRequest request,
            @AuthenticationPrincipal Object principal,
            HttpServletRequest httpRequest) {
        UUID actorId = (principal instanceof UserPrincipal up) ? up.getId() : UUID.randomUUID();
        String actorUsername = (principal instanceof UserPrincipal up) ? up.getUsername() : (principal != null ? principal.toString() : "system");
        BookResponse response = bookService.createBook(request, actorId, actorUsername, httpRequest.getRemoteAddr());
        return ApiResponse.success(response, "Book created successfully");
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'LIBRARIAN')")
    @Operation(summary = "Update a book", description = "ADMIN / LIBRARIAN: Update book metadata and inventory")
    public ApiResponse<BookResponse> updateBook(
            @PathVariable UUID id,
            @Valid @RequestBody BookRequest request,
            @AuthenticationPrincipal Object principal,
            HttpServletRequest httpRequest) {
        UUID actorId = (principal instanceof UserPrincipal up) ? up.getId() : UUID.randomUUID();
        String actorUsername = (principal instanceof UserPrincipal up) ? up.getUsername() : (principal != null ? principal.toString() : "system");
        BookResponse response = bookService.updateBook(id, request, actorId, actorUsername, httpRequest.getRemoteAddr());
        return ApiResponse.success(response, "Book updated successfully");
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'LIBRARIAN')")
    @Operation(summary = "Update book status", description = "ADMIN / LIBRARIAN: Set book to ACTIVE, MAINTENANCE, or RETIRED")
    public ApiResponse<BookResponse> updateBookStatus(
            @PathVariable UUID id,
            @Valid @RequestBody BookStatusRequest request,
            @AuthenticationPrincipal Object principal,
            HttpServletRequest httpRequest) {
        UUID actorId = (principal instanceof UserPrincipal up) ? up.getId() : UUID.randomUUID();
        String actorUsername = (principal instanceof UserPrincipal up) ? up.getUsername() : (principal != null ? principal.toString() : "system");
        BookResponse response = bookService.updateBookStatus(id, request.getStatus(), actorId, actorUsername, httpRequest.getRemoteAddr());
        return ApiResponse.success(response, "Book status updated successfully");
    }
}
