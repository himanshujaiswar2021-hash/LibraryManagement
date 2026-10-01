# REST API Specification: Library Management System

This document outlines the complete REST API for the Library Management System.

## Base URL
`/api/v1`

## Authentication
All endpoints except `POST /api/v1/auth/login` require a valid JWT in the Authorization header.
Format: `Authorization: Bearer <access_token>`

## Common Response Format

### Success
```json
{
  "success": true,
  "data": {},
  "message": "Operation completed successfully",
  "requestId": "550e8400-e29b-41d4-a716-446655440000"
}
```

### Paginated Success
```json
{
  "success": true,
  "data": {
    "content": [],
    "page": 0,
    "size": 20,
    "totalElements": 100,
    "totalPages": 5,
    "first": true,
    "last": false
  },
  "message": "Books retrieved successfully",
  "requestId": "550e8400-e29b-41d4-a716-446655440001"
}
```

### Error
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "fieldErrors": [
      { "field": "isbn", "message": "ISBN is required" }
    ]
  },
  "requestId": "550e8400-e29b-41d4-a716-446655440002"
}
```

## Common HTTP Status Codes
| Status | Usage |
|--------|-------|
| 200 | Success |
| 201 | Created |
| 204 | No Content (successful delete) |
| 400 | Bad Request / Validation Error |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict (duplicate) |
| 422 | Unprocessable Entity |
| 500 | Internal Server Error |

## Common Query Parameters
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | int | 0 | Page number (0-indexed) |
| size | int | 20 | Page size (max 100) |
| sort | string | varies | Sort field,direction (e.g., title,asc) |
| search | string | | Full-text search term |

---

## Authentication Endpoints

### POST `/api/v1/auth/login`
Authenticates a user and returns a JWT access token. Also sets an `httpOnly` refresh token cookie.

- **Roles**: Public
- **Request Body**:
  ```json
  {
    "username": "admin_user",
    "password": "securepassword123"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "accessToken": "eyJhbGciOiJIUzI1...",
      "tokenType": "Bearer",
      "expiresIn": 900,
      "user": {
        "id": "u-1234",
        "username": "admin_user",
        "email": "admin@library.local",
        "fullName": "System Administrator",
        "role": "ADMIN"
      }
    },
    "message": "Login successful",
    "requestId": "req-1"
  }
  ```
- **Errors**: `INVALID_CREDENTIALS`, `USER_INACTIVE`

### POST `/api/v1/auth/refresh`
Refreshes the access token using the `httpOnly` refresh token cookie.

- **Roles**: Authenticated
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "accessToken": "eyJhbGciOiJIUzI1...",
      "tokenType": "Bearer",
      "expiresIn": 900
    },
    "message": "Token refreshed",
    "requestId": "req-2"
  }
  ```
- **Errors**: `INVALID_REFRESH_TOKEN`

### POST `/api/v1/auth/logout`
Logs the user out by clearing the refresh token cookie.

- **Roles**: Authenticated
- **Response**: `204 No Content`

### GET `/api/v1/auth/me`
Retrieves information about the currently authenticated user.

- **Roles**: Authenticated
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "id": "u-1234",
      "username": "admin_user",
      "email": "admin@library.local",
      "fullName": "System Administrator",
      "role": "ADMIN"
    },
    "message": "Current user retrieved",
    "requestId": "req-3"
  }
  ```

---

## User Management

### GET `/api/v1/users`
List and search system users.

- **Roles**: ADMIN
- **Query Params**: `page`, `size`, `sort`, `search`, `role`, `status`
- **Response**: Paginated `User` objects.

### GET `/api/v1/users/{id}`
Get detailed information about a specific user.

- **Roles**: ADMIN
- **Response**: `User` object.
- **Errors**: `USER_NOT_FOUND`

### POST `/api/v1/users`
Create a new system user.

- **Roles**: ADMIN
- **Request Body**:
  ```json
  {
    "username": "new_librarian",
    "password": "TempPassword123!",
    "email": "lib@library.local",
    "fullName": "Jane Doe",
    "role": "LIBRARIAN"
  }
  ```
- **Response**: `201 Created` with created `User`.
- **Errors**: `USER_ALREADY_EXISTS`, `VALIDATION_ERROR`

### PUT `/api/v1/users/{id}`
Update an existing user's details.

- **Roles**: ADMIN
- **Request Body**: Contains fields to update (`email`, `fullName`, `role`).
- **Response**: Updated `User`.
- **Errors**: `USER_NOT_FOUND`

### PATCH `/api/v1/users/{id}/status`
Activate or deactivate a user account.

- **Roles**: ADMIN
- **Request Body**:
  ```json
  { "active": false }
  ```
- **Response**: Updated `User`.

### PUT `/api/v1/users/{id}/password`
Change user password.

- **Roles**: ADMIN or Self
- **Request Body**:
  ```json
  {
    "oldPassword": "current_password",
    "newPassword": "new_secure_password"
  }
  ```

---

## Book Management

### GET `/api/v1/books`
List and search books in the catalog.

- **Roles**: All authenticated
- **Query Params**: `search`, `category`, `author`, `available` (boolean), `status`, `page`, `size`, `sort`
- **Response**: Paginated `Book` list.

### GET `/api/v1/books/{id}`
Get complete details of a specific book including availability.

- **Roles**: All authenticated
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "id": "b-1001",
      "title": "The Great Gatsby",
      "isbn": "978-0743273565",
      "publishedYear": 1925,
      "publisher": "Scribner",
      "totalCopies": 5,
      "availableCopies": 3,
      "status": "ACTIVE",
      "authors": [{"id": "a-1", "name": "F. Scott Fitzgerald"}],
      "categories": [{"id": "c-1", "name": "Classic Fiction"}]
    },
    "message": "Book details retrieved",
    "requestId": "req-4"
  }
  ```

### POST `/api/v1/books`
Add a new book to the catalog.

- **Roles**: ADMIN, LIBRARIAN
- **Request Body**:
  ```json
  {
    "title": "Clean Code",
    "isbn": "978-0132350884",
    "publishedYear": 2008,
    "publisher": "Prentice Hall",
    "totalCopies": 10,
    "authorIds": ["a-2"],
    "categoryIds": ["c-2", "c-3"]
  }
  ```
- **Response**: `201 Created`
- **Errors**: `ISBN_ALREADY_EXISTS`

### PUT `/api/v1/books/{id}`
Update book metadata.

- **Roles**: ADMIN, LIBRARIAN
- **Request Body**: Full book fields.
- **Errors**: `BOOK_NOT_FOUND`

### PATCH `/api/v1/books/{id}/status`
Change book operational status (e.g., ACTIVE, MAINTENANCE, RETIRED).

- **Roles**: ADMIN, LIBRARIAN
- **Request Body**: `{ "status": "RETIRED" }`

### GET `/api/v1/books/{id}/loans`
Get loan history for a specific book.

- **Roles**: ADMIN, LIBRARIAN
- **Query Params**: `page`, `size`
- **Response**: Paginated `Loan` history.

---

## Category Management

### GET `/api/v1/categories`
List all book categories.

- **Roles**: All authenticated
- **Response**: List of `Category` objects.

### POST `/api/v1/categories`
Create a new category.

- **Roles**: ADMIN, LIBRARIAN
- **Request Body**: `{ "name": "Science Fiction", "description": "Sci-Fi books" }`

### PUT `/api/v1/categories/{id}`
Update category details.

- **Roles**: ADMIN, LIBRARIAN

---

## Author Management

### GET `/api/v1/authors`
List all authors.

- **Roles**: All authenticated

### POST `/api/v1/authors`
Create a new author.

- **Roles**: ADMIN, LIBRARIAN
- **Request Body**: `{ "name": "Robert C. Martin", "bio": "Software Engineer" }`

### PUT `/api/v1/authors/{id}`
Update author details.

- **Roles**: ADMIN, LIBRARIAN

---

## Member Management

### GET `/api/v1/members`
List and search library members.

- **Roles**: ADMIN, LIBRARIAN
- **Query Params**: `search`, `status`, `page`, `size`, `sort`
- **Response**: Paginated `Member` objects.

### GET `/api/v1/members/{id}`
Get member details.

- **Roles**: ADMIN, LIBRARIAN, MEMBER (if own profile)

### POST `/api/v1/members`
Register a new library member.

- **Roles**: ADMIN, LIBRARIAN
- **Request Body**:
  ```json
  {
    "firstName": "John",
    "lastName": "Smith",
    "email": "john.smith@example.com",
    "phone": "+1234567890",
    "address": "123 Library St"
  }
  ```

### PUT `/api/v1/members/{id}`
Update member information.

- **Roles**: ADMIN, LIBRARIAN

### PATCH `/api/v1/members/{id}/status`
Suspend or activate a member.

- **Roles**: ADMIN, LIBRARIAN
- **Request Body**: `{ "status": "SUSPENDED", "reason": "Overdue fines" }`

### GET `/api/v1/members/{id}/loans`
Get currently active loans for a member.

- **Roles**: ADMIN, LIBRARIAN, MEMBER (own)
- **Response**: List of active `Loan` objects.

### GET `/api/v1/members/{id}/loans/history`
Get complete loan history for a member.

- **Roles**: ADMIN, LIBRARIAN, MEMBER (own)

---

## Loan/Transaction Management

### POST `/api/v1/loans/issue`
Issue a book to a member.

- **Roles**: ADMIN, LIBRARIAN
- **Validations**: Member active, book available, copies > 0, loan limit not exceeded, no duplicate active loan for the same book.
- **Request Body**:
  ```json
  {
    "bookId": "b-1001",
    "memberId": "m-500",
    "dueDate": "2024-05-20T23:59:59Z",
    "notes": "Good condition"
  }
  ```
  *(dueDate is optional, defaults to 14 days)*
- **Response**: `201 Created` with created `Loan` details.
- **Errors**: `BOOK_UNAVAILABLE`, `MEMBER_SUSPENDED`, `LOAN_LIMIT_EXCEEDED`

### POST `/api/v1/loans/{id}/return`
Process a book return.

- **Roles**: ADMIN, LIBRARIAN
- **Request Body**:
  ```json
  { "notes": "Returned with minor scratch" }
  ```
- **Response**: Updated `Loan` details including any calculated fine if overdue.

### POST `/api/v1/loans/{id}/renew`
Renew an active loan. Extends due date by 14 days, increments `renewal_count`. Maximum 2 renewals allowed.

- **Roles**: ADMIN, LIBRARIAN
- **Response**: Updated `Loan` details.
- **Errors**: `MAX_RENEWALS_REACHED`, `BOOK_RESERVED_BY_OTHER`

### POST `/api/v1/loans/{id}/lost`
Mark a loaned book as lost. Updates book inventory and applies replacement fee to member.

- **Roles**: ADMIN, LIBRARIAN

### POST `/api/v1/loans/{id}/cancel`
Cancel a loan entry (e.g., issued by mistake).

- **Roles**: ADMIN

### GET `/api/v1/loans`
List all loans with filtering.

- **Roles**: ADMIN, LIBRARIAN
- **Query Params**: `status`, `memberId`, `bookId`, `overdue` (boolean), `page`, `size`, `sort`

### GET `/api/v1/loans/{id}`
Get specific loan details.

- **Roles**: ADMIN, LIBRARIAN, MEMBER (own loans)

### GET `/api/v1/loans/overdue`
Retrieve a list of all currently overdue loans.

- **Roles**: ADMIN, LIBRARIAN
- **Response**: Paginated list of overdue `Loan` objects.

---

## Dashboard

### GET `/api/v1/dashboard/stats`
Get overall system statistics.

- **Roles**: ADMIN, LIBRARIAN
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "totalBooks": 15420,
      "totalAvailableCopies": 12300,
      "totalMembers": 3450,
      "activeLoans": 3120,
      "overdueLoans": 45,
      "totalCategories": 42,
      "totalAuthors": 890
    },
    "message": "Stats retrieved"
  }
  ```

### GET `/api/v1/dashboard/recent-activity`
Get recent loan transactions (last 10).

- **Roles**: ADMIN, LIBRARIAN
- **Response**: List of recent `Loan` and `Return` events.

### GET `/api/v1/dashboard/most-borrowed`
Get top 10 most borrowed books.

- **Roles**: ADMIN, LIBRARIAN

### GET `/api/v1/dashboard/overdue-members`
Get a list of members with currently overdue books for quick follow-up.

- **Roles**: ADMIN, LIBRARIAN

---

## Audit Log

### GET `/api/v1/audit`
Retrieve system audit logs for administrative oversight.

- **Roles**: ADMIN
- **Query Params**:
  - `eventType`: e.g., `USER_CREATED`, `BOOK_DELETED`
  - `entityType`: e.g., `USER`, `BOOK`, `MEMBER`
  - `entityId`: Specific entity reference
  - `userId`: User who performed the action
  - `from`, `to`: Date range
  - `page`, `size`, `sort`
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "content": [
        {
          "id": "audit-999",
          "timestamp": "2023-11-01T10:00:00Z",
          "userId": "u-1234",
          "eventType": "MEMBER_SUSPENDED",
          "entityType": "MEMBER",
          "entityId": "m-500",
          "details": "Suspended due to unpaid fines"
        }
      ],
      "page": 0,
      "size": 20,
      "totalElements": 1,
      "totalPages": 1,
      "first": true,
      "last": true
    },
    "message": "Audit logs retrieved"
  }
  ```
