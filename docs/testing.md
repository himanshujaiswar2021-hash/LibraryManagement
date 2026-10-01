# Comprehensive Testing Strategy

## 1. Testing Pyramid & Objectives

Our testing strategy ensures correctness, data integrity, and high resilience across all layers:

```
          / \
         / E2E \       Playwright UI & User Journey Tests
        /-------\
       /   API   \     Spring WebMvcTest / RestAssured / MockMvc
      /-----------\
     / Integration \   Testcontainers (PostgreSQL), SpringBootTest, Repository Tests
    /---------------\
   /   Unit Tests    \ JUnit 5, Mockito, Vitest (Frontend Domain & UI)
  /-------------------\
```

---

## 2. Testing Layers

### 2.1 Backend Unit Tests
- **Frameworks**: JUnit 5, Mockito, AssertJ.
- **Scope**:
  - Domain models (e.g. loan overdue calculation, copy availability transitions, fine calculations).
  - Service layer business logic with mocked repositories.
  - Custom validators, JWT token parsing, and security authorization checks.
- **Coverage Gate**: Minimum 80% JaCoCo instruction and branch coverage on domain and service layers.

### 2.2 Backend Integration Tests
- **Frameworks**: Spring Boot Test, Testcontainers (PostgreSQL).
- **Scope**:
  - Flyway migration application and schema integrity.
  - Spring Data JPA custom queries and index performance.
  - Concurrency tests: simulating 10 concurrent requests to issue the single remaining book copy to verify pessimistic locking prevents overselling (negative copy count).
  - Transaction rollback verification under runtime exceptions.

### 2.3 Backend API & Security Tests
- **Frameworks**: `MockMvc` / `WebMvcTest` with `@WithMockUser`.
- **Scope**:
  - Request serialization/deserialization and validation errors.
  - HTTP status codes (200, 201, 400, 401, 403, 404, 409).
  - RBAC enforcement across all endpoints (verifying that `MEMBER` cannot issue books or view audit logs, etc.).

### 2.4 Frontend Unit & Component Tests
- **Frameworks**: Vitest, React Testing Library, jsdom.
- **Scope**:
  - Form validation states (book registration, member forms).
  - Responsive table rendering, sorting, and pagination controls.
  - Protected route guard redirects.
  - Custom React hooks (e.g., `useAuth`, `useLoans`).

### 2.5 End-to-End (E2E) Browser Tests
- **Frameworks**: Playwright.
- **Scope**:
  - Complete user workflows:
    1. Admin logs in -> Creates a new book -> Registers a new member.
    2. Librarian logs in -> Issues book to member -> Verifies book availability decrements from 5 to 4.
    3. Member logs in -> Verifies active loan in personal dashboard.
    4. Librarian returns book -> Verifies loan status is RETURNED and copy count restored to 5.
    5. Unauthorized role access verification (attempting to access admin routes directly via URL).

---

## 3. Automated Quality Gates

Every CI build must enforce:
1. **Compilation & Linting**: Zero compiler warnings, ESLint and Prettier passing.
2. **Unit & Integration Tests**: 100% test pass rate.
3. **Coverage Threshold**: JaCoCo report >= 80% on core services.
4. **Security Analysis**: Dependency vulnerability scanning (OWASP Dependency-Check / Trivy).
