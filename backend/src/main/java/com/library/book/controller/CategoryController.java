package com.library.book.controller;

import com.library.book.dto.CategoryDto;
import com.library.book.service.CategoryService;
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
@RequestMapping("/api/v1/categories")
@Tag(name = "Categories", description = "Book category catalog endpoints")
@SecurityRequirement(name = "bearerAuth")
public class CategoryController {

    private final CategoryService categoryService;

    public CategoryController(CategoryService categoryService) {
        this.categoryService = categoryService;
    }

    @GetMapping
    @Operation(summary = "List all categories")
    public ApiResponse<List<CategoryDto>> getAllCategories() {
        return ApiResponse.success(categoryService.getAllCategories());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get category by ID")
    public ApiResponse<CategoryDto> getCategoryById(@PathVariable UUID id) {
        return ApiResponse.success(categoryService.getCategoryById(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'LIBRARIAN')")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create a category", description = "ADMIN / LIBRARIAN: Add a new genre / category")
    public ApiResponse<CategoryDto> createCategory(@Valid @RequestBody CategoryDto dto) {
        return ApiResponse.success(categoryService.createCategory(dto), "Category created successfully");
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'LIBRARIAN')")
    @Operation(summary = "Update a category", description = "ADMIN / LIBRARIAN: Update category details")
    public ApiResponse<CategoryDto> updateCategory(@PathVariable UUID id, @Valid @RequestBody CategoryDto dto) {
        return ApiResponse.success(categoryService.updateCategory(id, dto), "Category updated successfully");
    }
}
