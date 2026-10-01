package com.library.book.controller;

import com.library.book.dto.AuthorDto;
import com.library.book.service.AuthorService;
import com.library.common.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/authors")
@Tag(name = "Authors", description = "Author catalog endpoints")
@SecurityRequirement(name = "bearerAuth")
public class AuthorController {

    private final AuthorService authorService;

    public AuthorController(AuthorService authorService) {
        this.authorService = authorService;
    }

    @GetMapping
    @Operation(summary = "List all authors")
    public ApiResponse<List<AuthorDto>> getAllAuthors() {
        return ApiResponse.success(authorService.getAllAuthors());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get author by ID")
    public ApiResponse<AuthorDto> getAuthorById(@PathVariable UUID id) {
        return ApiResponse.success(authorService.getAuthorById(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'LIBRARIAN')")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create an author", description = "ADMIN / LIBRARIAN: Add a new author")
    public ApiResponse<AuthorDto> createAuthor(@Valid @RequestBody AuthorDto dto) {
        return ApiResponse.success(authorService.createAuthor(dto), "Author created successfully");
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'LIBRARIAN')")
    @Operation(summary = "Update an author", description = "ADMIN / LIBRARIAN: Update author details")
    public ApiResponse<AuthorDto> updateAuthor(@PathVariable UUID id, @Valid @RequestBody AuthorDto dto) {
        return ApiResponse.success(authorService.updateAuthor(id, dto), "Author updated successfully");
    }
}
