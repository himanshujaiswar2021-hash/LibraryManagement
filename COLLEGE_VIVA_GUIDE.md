# 🎓 College Project Presentation & Viva Guide
## Project Title: Automated Library Management System with Microservices & DevOps Architecture

---

## 1. 💡 Project Summary (Say this in the first 30 seconds)
> *"Good morning/afternoon, Professor. My project is an **Enterprise Library Management System**. It digitizes traditional library operations like cataloging books on physical racks, issuing and returning books to students, tracking overdue daily fines, and managing book reservations. To make the system scalable and modern, I built it using a **React frontend**, a **Spring Boot REST API backend**, and a **microservices & Docker container architecture**."*

---

## 2. 🏗️ High-Level Architecture (3-Tier Model)

You can draw or explain this simple 3-tier diagram on a whiteboard:

```
[ FRONTEND ] (Port 3000)
React.js + Tailwind CSS + Vite
        │
        │ HTTP REST Calls (JSON)
        ▼
[ BACKEND API GATEWAY / CORE ] (Port 8088)
Spring Boot 3 + Spring Data JPA + Security
        │
   ┌────┴───────────────────────────┐
   ▼                                ▼
[ MICROSERVICES ]          [ DATABASE ]
- Notification (8082)       - H2 (In-Memory for Demo)
- Reservation (8083)        - PostgreSQL (Production / Docker)
- Payment & Fines (8084)
```

### Explanation of Each Layer:
1. **Presentation Layer (Frontend):**
   - Built with **React** and **Vite**.
   - Gives the librarian an interactive dashboard to view books on shelf racks, issue books with a single click, and calculate fines.
2. **Application / Business Logic Layer (Backend):**
   - Built with **Java 21** and **Spring Boot 3**.
   - Handles the core business rules: e.g., checking if copies are available before checkout, decrementing rack inventory, calculating fines (\$0.50/day overdue).
3. **Data Layer (Database):**
   - **PostgreSQL**: For persistent relational data storage (ACID compliant).
   - **H2 In-Memory Database**: Allows the backend to run on any laptop without needing to install or start a local database server.

---

## 3. 🧩 Key Modules & Features (How It Works)

### 1. Book Catalog & Rack Placement (`/books`)
- **What it does:** Organizes books by Category and assigns each book a physical shelf location (e.g., `Rack A-1 (Shelf CS-01)`).
- **Stock Tracking:** Every book tracks `totalCopies` and `availableCopies`.
  - When a book is issued: Available copies on rack decreases by 1.
  - When a book is returned: Available copies on rack increases by 1.

### 2. Loan Circulation & Returns (`/loans`)
- **Issue (Checkout):** Select a member and a book $\rightarrow$ system sets a default **14-day** due date $\rightarrow$ generates a transaction ID (`TXN-2026-0001`).
- **Return (Checkin):** Restocks the copy on the shelf and checks if the return date is past the due date.
- **Renew:** Extends the due date by 14 additional days (up to 2 times).

### 3. Overdue & Fine Recovery (`/overdue` and `/payments`)
- **Automatic Fine Calculation:** If current date > due date, system calculates:
  $$\text{Fine} = \text{Days Overdue} \times \$0.50$$
- **Settlement:** Librarian can accept cash/card payment or waive the fee with a reason.

### 4. Member Management (`/members`)
- Tracks student/faculty patrons, their contact details, active loan counts, and maximum borrowing limit (e.g., maximum 5 books).

---

## 4. 🐳 Why "DevOps" in the Project Name? (Important for Examiners!)
College teachers love asking: *"What DevOps concepts did you implement?"*

Here are the 4 points to answer:
1. **Containerization (Docker):**
   - Both the frontend, backend, database, and microservices have their own `Dockerfile`.
   - The entire multi-container stack can start with a single command: `docker compose up`.
2. **Microservices Architecture:**
   - Rather than keeping everything inside one giant codebase, auxiliary features are decoupled into independent microservices:
     - `notification-service`: Sends email/in-app reminders for overdue items.
     - `reservation-service`: Manages the waiting queue when all book copies are borrowed.
     - `payment-service`: Handles transaction ledgers and fine payments.
3. **Health Monitoring & Observability (Spring Actuator):**
   - Built-in health check endpoints (`/actuator/health` and `/actuator/prometheus`) report liveness and readiness metrics to monitoring tools.
4. **Resilience & Fallback:**
   - If the backend is temporarily offline, the frontend's local fallback store (`localStore.ts`) ensures the UI never crashes during presentations.

---

## 5. 🚀 How to Run the Project (Simple 2 Steps)

### Step 1: Run Backend
```powershell
cd d:\LibraryManagementDevops\backend
.\mvnw.cmd spring-boot:run
```
- Runs on: `http://localhost:8088`
- Health check: `http://localhost:8088/actuator/health`

### Step 2: Run Frontend
```powershell
cd d:\LibraryManagementDevops\frontend
npm start
```
- Runs on: `http://localhost:3000`

---

## 6. ❓ Top 7 College Viva Questions & Perfect Answers

#### Q1: "What design pattern did you follow in Spring Boot?"
> **Answer:** *"I followed the standard **Controller-Service-Repository** layered architecture:*
> - *Controllers handle incoming HTTP REST requests and endpoints.*
> - *Services execute business rules (like loan validation).*
> - *Repositories use Spring Data JPA for database queries without writing raw SQL."*

#### Q2: "How is data validated when a new book or loan is created?"
> **Answer:** *"We use Spring Validation annotations like `@NotNull`, `@NotBlank`, and `@Min(1)` on Data Transfer Objects (DTOs), and client-side form validation in React before submission."*

#### Q3: "What happens if two people try to borrow the last copy of a book at the same time?"
> **Answer:** *"In `BookRepository.java`, we implemented `@Lock(LockModeType.PESSIMISTIC_WRITE)` on the book record. This locks the database row during transaction checkout so two concurrent requests cannot double-borrow the same physical copy."*

#### Q4: "How does the frontend communicate with the backend?"
> **Answer:** *"Via HTTP REST APIs using the `Axios` HTTP client with JSON payloads. The Vite dev server proxies `/api` calls directly to `http://localhost:8088` to avoid CORS issues."*

#### Q5: "Why did you use React instead of standard HTML/JSP?"
> **Answer:** *"React uses component-based architecture and a Virtual DOM. This allows reactive state management—for example, when a book is issued, the rack availability updates instantly without reloading the entire page."*

#### Q6: "Which database does the project use?"
> **Answer:** *"It supports **PostgreSQL** in production/Docker for persistent relational storage, and an **H2 in-memory database** for lightweight local development and live demonstrations."*

#### Q7: "How is security handled?"
> **Answer:** *"The system includes Spring Security with JWT (JSON Web Tokens) token validation and role-based access control (Admin, Librarian, Member). For our demo setup, open access is enabled so teachers and students can test all features without credential blockers."*
