package com.library.book.repository;

import com.library.book.domain.Book;
import com.library.book.domain.BookStatus;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface BookRepository extends JpaRepository<Book, UUID> {

    Optional<Book> findByIsbn(String isbn);
    boolean existsByIsbn(String isbn);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT b FROM Book b WHERE b.id = :id")
    Optional<Book> findByIdWithLock(@Param("id") UUID id);

    @Query("SELECT DISTINCT b FROM Book b " +
           "LEFT JOIN b.authors a " +
           "LEFT JOIN b.categories c " +
           "WHERE (:status IS NULL OR b.status = :status) " +
           "AND (:availableOnly IS NULL OR (:availableOnly = TRUE AND b.availableCopies > 0) OR (:availableOnly = FALSE AND b.availableCopies = 0)) " +
           "AND (:categoryId IS NULL OR c.id = :categoryId) " +
           "AND (:authorId IS NULL OR a.id = :authorId) " +
           "AND (CAST(:search AS string) IS NULL OR " +
           "     LOWER(b.title) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%')) OR " +
           "     LOWER(b.isbn) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%')) OR " +
           "     LOWER(b.publisher) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%')) OR " +
           "     LOWER(a.name) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%')) OR " +
           "     LOWER(c.name) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%')))")
    Page<Book> searchBooks(
            @Param("search") String search,
            @Param("categoryId") UUID categoryId,
            @Param("authorId") UUID authorId,
            @Param("availableOnly") Boolean availableOnly,
            @Param("status") BookStatus status,
            Pageable pageable);

    @Query("SELECT COUNT(b) FROM Book b WHERE b.status = 'ACTIVE'")
    long countActiveBooks();

    @Query("SELECT COALESCE(SUM(b.totalCopies), 0) FROM Book b WHERE b.status = 'ACTIVE'")
    long sumTotalCopies();

    @Query("SELECT COALESCE(SUM(b.availableCopies), 0) FROM Book b WHERE b.status = 'ACTIVE'")
    long sumAvailableCopies();
}
