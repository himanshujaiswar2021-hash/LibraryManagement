package com.library.api;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.library.book.domain.BookStatus;
import com.library.book.dto.BookRequest;
import com.library.book.dto.BookResponse;
import com.library.book.service.BookService;
import com.library.common.dto.PagedResponse;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.domain.PageImpl;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Collections;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class BookControllerApiTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private BookService bookService;

    @Test
    @WithMockUser(username = "member", roles = {"MEMBER"})
    @DisplayName("GET /api/v1/books should return 200 with paginated books for authenticated member")
    void shouldReturnBooksForAuthenticatedUser() throws Exception {
        BookResponse bookResponse = new BookResponse();
        bookResponse.setId(UUID.randomUUID());
        bookResponse.setTitle("Clean Architecture");
        bookResponse.setIsbn("978-0134494166");
        bookResponse.setAvailableCopies(3);
        bookResponse.setTotalCopies(3);
        bookResponse.setStatus(BookStatus.ACTIVE);

        when(bookService.searchBooks(any(), any(), any(), any(), any(), any()))
                .thenReturn(new PageImpl<>(Collections.singletonList(bookResponse)));

        mockMvc.perform(get("/api/v1/books")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content[0].title").value("Clean Architecture"))
                .andExpect(jsonPath("$.data.content[0].isbn").value("978-0134494166"));
    }

    @Test
    @WithMockUser(username = "member", roles = {"MEMBER"})
    @DisplayName("POST /api/v1/books should return 403 Forbidden for MEMBER role")
    void shouldDenyBookCreationForMemberRole() throws Exception {
        BookRequest request = new BookRequest();
        request.setTitle("Unauthorized Add");
        request.setIsbn("978-0000000000");

        mockMvc.perform(post("/api/v1/books")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("GET /api/v1/books should return 401 Unauthorized for unauthenticated requests")
    void shouldDenyUnauthenticatedAccess() throws Exception {
        mockMvc.perform(get("/api/v1/books"))
                .andExpect(status().isUnauthorized());
    }
}
