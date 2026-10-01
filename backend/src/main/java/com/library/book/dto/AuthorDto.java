package com.library.book.dto;

import com.library.book.domain.Author;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.UUID;

public class AuthorDto {
    private UUID id;

    @NotBlank(message = "Author name is required")
    @Size(min = 2, max = 150, message = "Author name must be between 2 and 150 characters")
    private String name;

    private String bio;

    public AuthorDto() {}

    public AuthorDto(UUID id, String name, String bio) {
        this.id = id;
        this.name = name;
        this.bio = bio;
    }

    public static AuthorDto from(Author author) {
        return new AuthorDto(author.getId(), author.getName(), author.getBio());
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }
}
