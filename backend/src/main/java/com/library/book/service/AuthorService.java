package com.library.book.service;

import com.library.book.domain.Author;
import com.library.book.dto.AuthorDto;
import com.library.book.repository.AuthorRepository;
import com.library.common.exception.ConflictException;
import com.library.common.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class AuthorService {

    private final AuthorRepository authorRepository;

    public AuthorService(AuthorRepository authorRepository) {
        this.authorRepository = authorRepository;
    }

    @Transactional(readOnly = true)
    public List<AuthorDto> getAllAuthors() {
        return authorRepository.findAll().stream()
                .map(AuthorDto::from)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public AuthorDto getAuthorById(UUID id) {
        Author author = authorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("AUTHOR_NOT_FOUND", "Author not found with id: " + id));
        return AuthorDto.from(author);
    }

    @Transactional
    public AuthorDto createAuthor(AuthorDto dto) {
        if (authorRepository.existsByNameIgnoreCase(dto.getName().trim())) {
            throw new ConflictException("AUTHOR_ALREADY_EXISTS", "Author with this name already exists");
        }
        Author author = new Author(dto.getName().trim(), dto.getBio());
        Author saved = authorRepository.save(author);
        return AuthorDto.from(saved);
    }

    @Transactional
    public AuthorDto updateAuthor(UUID id, AuthorDto dto) {
        Author author = authorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("AUTHOR_NOT_FOUND", "Author not found with id: " + id));

        author.setName(dto.getName().trim());
        author.setBio(dto.getBio());
        return AuthorDto.from(authorRepository.save(author));
    }
}
