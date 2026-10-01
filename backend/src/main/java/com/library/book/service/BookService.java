package com.library.book.service;

import com.library.audit.service.AuditService;
import com.library.book.domain.Author;
import com.library.book.domain.Book;
import com.library.book.domain.BookStatus;
import com.library.book.domain.Category;
import com.library.book.dto.BookRequest;
import com.library.book.dto.BookResponse;
import com.library.book.repository.AuthorRepository;
import com.library.book.repository.BookRepository;
import com.library.book.repository.CategoryRepository;
import com.library.common.exception.BusinessRuleException;
import com.library.common.exception.ConflictException;
import com.library.common.exception.ResourceNotFoundException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Service
public class BookService {

    private final BookRepository bookRepository;
    private final AuthorRepository authorRepository;
    private final CategoryRepository categoryRepository;
    private final AuditService auditService;

    public BookService(
            BookRepository bookRepository,
            AuthorRepository authorRepository,
            CategoryRepository categoryRepository,
            AuditService auditService) {
        this.bookRepository = bookRepository;
        this.authorRepository = authorRepository;
        this.categoryRepository = categoryRepository;
        this.auditService = auditService;
    }

    @Transactional(readOnly = true)
    public Page<BookResponse> searchBooks(String search, UUID categoryId, UUID authorId, Boolean availableOnly, BookStatus status, Pageable pageable) {
        return bookRepository.searchBooks(search, categoryId, authorId, availableOnly, status, pageable)
                .map(BookResponse::from);
    }

    @Transactional(readOnly = true)
    public BookResponse getBookById(UUID id) {
        Book book = bookRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("BOOK_NOT_FOUND", "Book not found with id: " + id));
        return BookResponse.from(book);
    }

    @Transactional
    public BookResponse createBook(BookRequest request, UUID actorId, String actorUsername, String ipAddress) {
        if (bookRepository.existsByIsbn(request.getIsbn().trim())) {
            throw new ConflictException("ISBN_ALREADY_EXISTS", "A book with ISBN " + request.getIsbn() + " already exists");
        }

        Book book = new Book();
        book.setIsbn(request.getIsbn().trim());
        book.setTitle(request.getTitle().trim());
        book.setSubtitle(request.getSubtitle());
        book.setPublisher(request.getPublisher());
        book.setPublicationYear(request.getPublicationYear());
        book.setDescription(request.getDescription());
        book.setLanguage(request.getLanguage() != null ? request.getLanguage() : "English");
        book.setTotalCopies(request.getTotalCopies());
        book.setAvailableCopies(request.getTotalCopies());
        book.setShelfLocation(request.getShelfLocation());
        book.setCoverImageUrl(request.getCoverImageUrl());
        book.setStatus(BookStatus.ACTIVE);

        if (request.getAuthorIds() != null && !request.getAuthorIds().isEmpty()) {
            Set<Author> authors = new HashSet<>(authorRepository.findAllById(request.getAuthorIds()));
            book.setAuthors(authors);
        }

        if (request.getCategoryIds() != null && !request.getCategoryIds().isEmpty()) {
            Set<Category> categories = new HashSet<>(categoryRepository.findAllById(request.getCategoryIds()));
            book.setCategories(categories);
        }

        Book saved = bookRepository.save(book);

        auditService.recordEventAsync(actorId, actorUsername, "BOOK_CREATED", "BOOK", saved.getId().toString(), ipAddress,
                "Created book: '" + saved.getTitle() + "' (ISBN: " + saved.getIsbn() + ")");

        return BookResponse.from(saved);
    }

    @Transactional
    public BookResponse updateBook(UUID id, BookRequest request, UUID actorId, String actorUsername, String ipAddress) {
        Book book = bookRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("BOOK_NOT_FOUND", "Book not found with id: " + id));

        if (!book.getIsbn().equalsIgnoreCase(request.getIsbn().trim()) && bookRepository.existsByIsbn(request.getIsbn().trim())) {
            throw new ConflictException("ISBN_ALREADY_EXISTS", "A book with ISBN " + request.getIsbn() + " already exists");
        }

        int borrowedCopies = book.getTotalCopies() - book.getAvailableCopies();
        if (request.getTotalCopies() < borrowedCopies) {
            throw new BusinessRuleException("INVALID_COPY_COUNT",
                    "Cannot set total copies to " + request.getTotalCopies() + " because " + borrowedCopies + " copies are currently borrowed");
        }

        book.setIsbn(request.getIsbn().trim());
        book.setTitle(request.getTitle().trim());
        book.setSubtitle(request.getSubtitle());
        book.setPublisher(request.getPublisher());
        book.setPublicationYear(request.getPublicationYear());
        book.setDescription(request.getDescription());
        book.setLanguage(request.getLanguage());
        book.setTotalCopies(request.getTotalCopies());
        book.setAvailableCopies(request.getTotalCopies() - borrowedCopies);
        book.setShelfLocation(request.getShelfLocation());
        book.setCoverImageUrl(request.getCoverImageUrl());

        if (request.getAuthorIds() != null) {
            Set<Author> authors = new HashSet<>(authorRepository.findAllById(request.getAuthorIds()));
            book.setAuthors(authors);
        }

        if (request.getCategoryIds() != null) {
            Set<Category> categories = new HashSet<>(categoryRepository.findAllById(request.getCategoryIds()));
            book.setCategories(categories);
        }

        Book updated = bookRepository.save(book);

        auditService.recordEventAsync(actorId, actorUsername, "BOOK_UPDATED", "BOOK", updated.getId().toString(), ipAddress,
                "Updated book: '" + updated.getTitle() + "' (ISBN: " + updated.getIsbn() + ")");

        return BookResponse.from(updated);
    }

    @Transactional
    public BookResponse updateBookStatus(UUID id, BookStatus status, UUID actorId, String actorUsername, String ipAddress) {
        Book book = bookRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("BOOK_NOT_FOUND", "Book not found with id: " + id));

        book.setStatus(status);
        Book updated = bookRepository.save(book);

        auditService.recordEventAsync(actorId, actorUsername, "BOOK_STATUS_CHANGED", "BOOK", updated.getId().toString(), ipAddress,
                "Changed status of book '" + updated.getTitle() + "' to " + status);

        return BookResponse.from(updated);
    }
}
