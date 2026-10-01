package com.library.api;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.library.loan.domain.LoanStatus;
import com.library.loan.dto.IssueLoanRequest;
import com.library.loan.dto.LoanResponse;
import com.library.loan.dto.ReturnLoanRequest;
import com.library.loan.service.LoanService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class LoanControllerApiTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private LoanService loanService;

    @Test
    @WithMockUser(username = "librarian", roles = {"LIBRARIAN"})
    @DisplayName("POST /api/v1/loans/issue should return 201 Created for Librarian")
    void shouldIssueBookForLibrarian() throws Exception {
        UUID bookId = UUID.randomUUID();
        UUID memberId = UUID.randomUUID();

        IssueLoanRequest request = new IssueLoanRequest(bookId, memberId, null, "Issued via test");

        LoanResponse response = new LoanResponse();
        response.setId(UUID.randomUUID());
        response.setLoanNumber("TXN-TEST-001");
        response.setStatus(LoanStatus.ISSUED);

        when(loanService.issueBook(any(), any(), any(), any())).thenReturn(response);

        mockMvc.perform(post("/api/v1/loans/issue")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.loanNumber").value("TXN-TEST-001"));
    }

    @Test
    @WithMockUser(username = "member", roles = {"MEMBER"})
    @DisplayName("POST /api/v1/loans/issue should return 403 Forbidden for MEMBER role")
    void shouldDenyIssueForMember() throws Exception {
        IssueLoanRequest request = new IssueLoanRequest(UUID.randomUUID(), UUID.randomUUID(), null, null);

        mockMvc.perform(post("/api/v1/loans/issue")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());
    }
}
