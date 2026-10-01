package com.library.book;

import com.library.audit.service.AuditService;
import com.library.book.domain.Book;
import com.library.book.domain.BookStatus;
import com.library.book.dto.BookRequest;
import com.library.book.dto.BookResponse;
import com.library.book.repository.AuthorRepository;
import com.library.book.repository.BookRepository;
import com.library.book.repository.CategoryRepository;
import com.library.book.service.BookService;
import com.library.common.exception.BusinessRuleException;
import com.library.common.exception.ConflictException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BookServiceTest {

    @Mock
    private BookRepository bookRepository;

    @Mock
    private AuthorRepository authorRepository;

    @Mock
    private CategoryRepository categoryRepository;

    @Mock
    private AuditService auditService;

    private BookService bookService;
    private UUID actorId;

    @BeforeEach
    void setUp() {
        bookService = new BookService(bookRepository, authorRepository, categoryRepository, auditService);
        actorId = UUID.randomUUID();
    }

    @Test
    @DisplayName("Should create a book with matching total and available copies")
    void shouldCreateBookSuccessfully() {
        BookRequest request = new BookRequest();
        request.setIsbn("978-0134685991");
        request.setTitle("Effective Java");
        request.setTotalCopies(4);
        request.setPublisher("Addison-Wesley");
        request.setPublicationYear(2018);

        when(bookRepository.existsByIsbn("978-0134685991")).thenReturn(false);
        when(bookRepository.save(any(Book.class))).thenAnswer(invocation -> {
            Book b = invocation.getArgument(0);
            b.setId(UUID.randomUUID());
            return b;
        });

        BookResponse response = bookService.createBook(request, actorId, "admin", "127.0.0.1");

        assertThat(response).isNotNull();
        assertThat(response.getTitle()).isEqualTo("Effective Java");
        assertThat(response.getTotalCopies()).isEqualTo(4);
        assertThat(response.getAvailableCopies()).isEqualTo(4);
        assertThat(response.getStatus()).isEqualTo(BookStatus.ACTIVE);
    }

    @Test
    @DisplayName("Should prevent creating book with duplicate ISBN")
    void shouldPreventDuplicateIsbn() {
        BookRequest request = new BookRequest();
        request.setIsbn("978-0134685991");
        request.setTitle("Duplicate Book");

        when(bookRepository.existsByIsbn("978-0134685991")).thenReturn(true);

        assertThatThrownBy(() -> bookService.createBook(request, actorId, "admin", "127.0.0.1"))
                .isInstanceOf(ConflictException.class)
                .hasMessageContaining("already exists");
    }

    @Test
    @DisplayName("Should prevent reducing total copies below currently borrowed count")
    void shouldPreventReducingTotalCopiesBelowBorrowedCount() {
        UUID bookId = UUID.randomUUID();
        Book existingBook = new Book();
        existingBook.setId(bookId);
        existingBook.setIsbn("978-0134685991");
        existingBook.setTitle("Existing Book");
        existingBook.setTotalCopies(10);
        existingBook.setAvailableCopies(6); // 4 borrowed

        when(bookRepository.findById(bookId)).thenReturn(Optional.of(existingBook));

        BookRequest updateRequest = new BookRequest();
        updateRequest.setIsbn("978-0134685991");
        updateRequest.setTitle("Existing Book");
        updateRequest.setTotalCopies(3); // trying to reduce total below 4

        assertThatThrownBy(() -> bookService.updateBook(bookId, updateRequest, actorId, "admin", "127.0.0.1"))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("currently borrowed");
    }
}
