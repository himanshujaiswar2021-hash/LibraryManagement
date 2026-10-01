# Domain Model & Entity Relationships

## 1. Domain Entities & Value Objects

The domain encapsulates four primary aggregates:
1. **User Aggregate**: System authentication and administrative users.
2. **Member Aggregate**: Library patrons eligible for borrowing.
3. **Book & Catalog Aggregate**: Books, Authors, Categories, and physical inventory copies.
4. **Loan Transaction Aggregate**: Checkouts, renewals, returns, and overdue tracking.
5. **Audit Event Aggregate**: Immutable append-only operational audit trail.

---

## 2. Entity Relationship Diagram

```mermaid
erDiagram
    USERS {
        uuid id PK
        varchar username UK
        varchar email UK
        varchar password_hash
        varchar full_name
        varchar role
        boolean active
        timestamp created_at
        timestamp updated_at
    }

    MEMBERS {
        uuid id PK
        varchar membership_number UK
        varchar first_name
        varchar last_name
        varchar email UK
        varchar phone
        varchar address
        varchar status
        int max_loans
        timestamp registration_date
        timestamp created_at
        timestamp updated_at
    }

    CATEGORIES {
        uuid id PK
        varchar name UK
        varchar description
        timestamp created_at
    }

    AUTHORS {
        uuid id PK
        varchar name
        varchar bio
        timestamp created_at
    }

    BOOKS {
        uuid id PK
        varchar isbn UK
        varchar title
        varchar subtitle
        varchar publisher
        int publication_year
        text description
        varchar language
        int total_copies
        int available_copies
        varchar shelf_location
        varchar cover_image_url
        varchar status
        timestamp created_at
        timestamp updated_at
    }

    BOOK_AUTHORS {
        uuid book_id FK
        uuid author_id FK
    }

    BOOK_CATEGORIES {
        uuid book_id FK
        uuid category_id FK
    }

    LOANS {
        uuid id PK
        varchar loan_number UK
        uuid book_id FK
        uuid member_id FK
        uuid issued_by FK
        uuid returned_by FK
        timestamp issue_date
        timestamp due_date
        timestamp return_date
        varchar status
        int renewal_count
        numeric fine_amount
        text notes
        timestamp created_at
        timestamp updated_at
    }

    AUDIT_EVENTS {
        uuid id PK
        timestamp timestamp
        uuid user_id
        varchar username
        varchar event_type
        varchar entity_type
        varchar entity_id
        varchar ip_address
        jsonb details
    }

    BOOKS ||--o{ BOOK_AUTHORS : "written by"
    AUTHORS ||--o{ BOOK_AUTHORS : "writes"
    BOOKS ||--o{ BOOK_CATEGORIES : "categorized as"
    CATEGORIES ||--o{ BOOK_CATEGORIES : "contains"
    MEMBERS ||--o{ LOANS : "borrows"
    BOOKS ||--o{ LOANS : "borrowed in"
    USERS ||--o{ LOANS : "issues / accepts return"
```

---

## 3. Detailed Entity Definitions

### 3.1 `User`
- **Fields**: `id` (UUID), `username` (Unique), `email` (Unique), `passwordHash`, `fullName`, `role` (`ADMIN`, `LIBRARIAN`, `MEMBER`), `active` (boolean), `createdAt`, `updatedAt`.
- **Invariants**: Username and email must be normalized (lowercase) and unique. Password must never be exposed or returned in DTOs.

### 3.2 `Member`
- **Fields**: `id` (UUID), `membershipNumber` (Unique, e.g. `MEM-2026-0001`), `firstName`, `lastName`, `email` (Unique), `phone`, `address`, `status` (`ACTIVE`, `SUSPENDED`, `INACTIVE`), `maxLoans` (default: 5), `registrationDate`, `createdAt`, `updatedAt`.
- **Invariants**: Only `ACTIVE` members can borrow books. Maximum active loans cannot exceed `maxLoans`.

### 3.3 `Book`
- **Fields**: `id` (UUID), `isbn` (Unique, ISBN-10 or ISBN-13 format), `title`, `subtitle`, `publisher`, `publicationYear`, `description`, `language`, `totalCopies`, `availableCopies`, `shelfLocation`, `coverImageUrl`, `status` (`ACTIVE`, `MAINTENANCE`, `RETIRED`), `createdAt`, `updatedAt`.
- **Invariants**:
  - `availableCopies >= 0`
  - `availableCopies <= totalCopies`
  - Total copies cannot be reduced below `(totalCopies - availableCopies)` (i.e., currently borrowed copies).

### 3.4 `Loan` (Transaction)
- **Fields**: `id` (UUID), `loanNumber` (Unique, e.g. `TXN-2026-0001`), `book` (ManyToOne), `member` (ManyToOne), `issuedBy` (ManyToOne User), `returnedBy` (ManyToOne User, nullable), `issueDate`, `dueDate`, `returnDate` (nullable), `status` (`ISSUED`, `RETURNED`, `OVERDUE`, `LOST`, `CANCELLED`), `renewalCount` (int, default 0), `fineAmount` (BigDecimal, default 0.00), `notes`, `createdAt`, `updatedAt`.
- **Business Invariants**:
  - **Issue**: Checks member is active, member active loan count < `maxLoans`, member does not already hold an active copy of the same book, book is active and `availableCopies > 0`. Atomically decrements `availableCopies` with pessimistic lock on Book row.
  - **Return**: Checks loan is currently `ISSUED` or `OVERDUE`. Sets `returnDate = now()`, `status = RETURNED`. Atomically increments `availableCopies`. Calculates days overdue and applies fine if applicable.
  - **Renew**: Checks `renewalCount < 2`, not overdue, and book is active. Extends `dueDate` by standard loan period (14 days) and increments `renewalCount`.
  - **Lost**: Marks book as `LOST`. Does not increment available copies; decrements `totalCopies`.

### 3.5 `AuditEvent`
- **Fields**: `id` (UUID), `timestamp`, `userId` (UUID, nullable for system actions), `username`, `eventType` (`BOOK_CREATED`, `BOOK_UPDATED`, `BOOK_DEACTIVATED`, `MEMBER_REGISTERED`, `MEMBER_SUSPENDED`, `LOAN_ISSUED`, `LOAN_RETURNED`, `LOAN_RENEWED`, `USER_LOGIN`, `USER_CREATED`), `entityType` (`BOOK`, `MEMBER`, `LOAN`, `USER`), `entityId`, `ipAddress`, `details` (JSONB / text).
