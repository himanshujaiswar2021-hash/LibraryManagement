package com.library.book.dto;

import com.library.book.domain.Book;
import com.library.book.domain.BookStatus;

import java.time.Instant;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

public class BookResponse {
    private UUID id;
    private String isbn;
    private String title;
    private String subtitle;
    private String publisher;
    private Integer publicationYear;
    private String description;
    private String language;
    private int totalCopies;
    private int availableCopies;
    private int borrowedCopies;
    private String shelfLocation;
    private String coverImageUrl;
    private BookStatus status;
    private Set<AuthorDto> authors;
    private Set<CategoryDto> categories;
    private Instant createdAt;
    private Instant updatedAt;

    public BookResponse() {}

    public static BookResponse from(Book book) {
        BookResponse res = new BookResponse();
        res.setId(book.getId());
        res.setIsbn(book.getIsbn());
        res.setTitle(book.getTitle());
        res.setSubtitle(book.getSubtitle());
        res.setPublisher(book.getPublisher());
        res.setPublicationYear(book.getPublicationYear());
        res.setDescription(book.getDescription());
        res.setLanguage(book.getLanguage());
        res.setTotalCopies(book.getTotalCopies());
        res.setAvailableCopies(book.getAvailableCopies());
        res.setBorrowedCopies(book.getTotalCopies() - book.getAvailableCopies());
        res.setShelfLocation(book.getShelfLocation());
        res.setCoverImageUrl(book.getCoverImageUrl());
        res.setStatus(book.getStatus());
        res.setCreatedAt(book.getCreatedAt());
        res.setUpdatedAt(book.getUpdatedAt());

        if (book.getAuthors() != null) {
            res.setAuthors(book.getAuthors().stream().map(AuthorDto::from).collect(Collectors.toSet()));
        }
        if (book.getCategories() != null) {
            res.setCategories(book.getCategories().stream().map(CategoryDto::from).collect(Collectors.toSet()));
        }

        return res;
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getIsbn() { return isbn; }
    public void setIsbn(String isbn) { this.isbn = isbn; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getSubtitle() { return subtitle; }
    public void setSubtitle(String subtitle) { this.subtitle = subtitle; }

    public String getPublisher() { return publisher; }
    public void setPublisher(String publisher) { this.publisher = publisher; }

    public Integer getPublicationYear() { return publicationYear; }
    public void setPublicationYear(Integer publicationYear) { this.publicationYear = publicationYear; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getLanguage() { return language; }
    public void setLanguage(String language) { this.language = language; }

    public int getTotalCopies() { return totalCopies; }
    public void setTotalCopies(int totalCopies) { this.totalCopies = totalCopies; }

    public int getAvailableCopies() { return availableCopies; }
    public void setAvailableCopies(int availableCopies) { this.availableCopies = availableCopies; }

    public int getBorrowedCopies() { return borrowedCopies; }
    public void setBorrowedCopies(int borrowedCopies) { this.borrowedCopies = borrowedCopies; }

    public String getShelfLocation() { return shelfLocation; }
    public void setShelfLocation(String shelfLocation) { this.shelfLocation = shelfLocation; }

    public String getCoverImageUrl() { return coverImageUrl; }
    public void setCoverImageUrl(String coverImageUrl) { this.coverImageUrl = coverImageUrl; }

    public BookStatus getStatus() { return status; }
    public void setStatus(BookStatus status) { this.status = status; }

    public Set<AuthorDto> getAuthors() { return authors; }
    public void setAuthors(Set<AuthorDto> authors) { this.authors = authors; }

    public Set<CategoryDto> getCategories() { return categories; }
    public void setCategories(Set<CategoryDto> categories) { this.categories = categories; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
