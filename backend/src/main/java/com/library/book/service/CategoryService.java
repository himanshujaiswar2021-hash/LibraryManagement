package com.library.book.service;

import com.library.book.domain.Category;
import com.library.book.dto.CategoryDto;
import com.library.book.repository.CategoryRepository;
import com.library.common.exception.ConflictException;
import com.library.common.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;

    public CategoryService(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    @Transactional(readOnly = true)
    public List<CategoryDto> getAllCategories() {
        return categoryRepository.findAll().stream()
                .map(CategoryDto::from)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public CategoryDto getCategoryById(UUID id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("CATEGORY_NOT_FOUND", "Category not found with id: " + id));
        return CategoryDto.from(category);
    }

    @Transactional
    public CategoryDto createCategory(CategoryDto dto) {
        if (categoryRepository.existsByNameIgnoreCase(dto.getName().trim())) {
            throw new ConflictException("CATEGORY_ALREADY_EXISTS", "Category with this name already exists");
        }
        Category category = new Category(dto.getName().trim(), dto.getDescription());
        Category saved = categoryRepository.save(category);
        return CategoryDto.from(saved);
    }

    @Transactional
    public CategoryDto updateCategory(UUID id, CategoryDto dto) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("CATEGORY_NOT_FOUND", "Category not found with id: " + id));

        category.setName(dto.getName().trim());
        category.setDescription(dto.getDescription());
        return CategoryDto.from(categoryRepository.save(category));
    }
}
