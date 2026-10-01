package com.library.book.dto;

import jakarta.validation.constraints.*;

import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

public class BookRequest {

    @NotBlank(message = "ISBN is required")
    @Pattern(regexp = "^(97(8|9))?\\d{9}(\\d|X)$|^[0-9-]{10,20}$", message = "ISBN format is invalid")
    private String isbn;

    @NotBlank(message = "Title is required")
    @Size(min = 1, max = 255, message = "Title must be between 1 and 255 characters")
    private String title;

    @Size(max = 255, message = "Subtitle must be under 255 characters")
    private String subtitle;

    @Size(max = 150, message = "Publisher must be under 150 characters")
    private String publisher;

    @Min(value = 1000, message = "Publication year must be >= 1000")
    @Max(value = 2100, message = "Publication year must be valid")
    private Integer publicationYear;

    private String description;

    private String language = "English";

    @Min(value = 1, message = "Total copies must be at least 1")
    private int totalCopies = 1;

    private String shelfLocation;

    private String coverImageUrl;

    private Set<UUID> authorIds = new HashSet<>();

    private Set<UUID> categoryIds = new HashSet<>();

    public BookRequest() {}

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

    public String getShelfLocation() { return shelfLocation; }
    public void setShelfLocation(String shelfLocation) { this.shelfLocation = shelfLocation; }

    public String getCoverImageUrl() { return coverImageUrl; }
    public void setCoverImageUrl(String coverImageUrl) { this.coverImageUrl = coverImageUrl; }

    public Set<UUID> getAuthorIds() { return authorIds; }
    public void setAuthorIds(Set<UUID> authorIds) { this.authorIds = authorIds; }

    public Set<UUID> getCategoryIds() { return categoryIds; }
    public void setCategoryIds(Set<UUID> categoryIds) { this.categoryIds = categoryIds; }
}
