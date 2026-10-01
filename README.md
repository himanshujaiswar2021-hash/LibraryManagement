# 📚 Enterprise Library Management System (LibMaster Pro)

A production-ready, cloud-native Library Management System for managing books, members, inventory, and loan checkouts/returns with ACID concurrency controls, role-based authorization, centralized observability, containerization, and automated CI/CD pipelines.

---

## 🏗️ Architecture & Technology Stack

| Layer | Technology |
|---|---|
| **Backend** | Java 21 (LTS), Spring Boot 3.3.4, Spring Data JPA, Spring Security 6 (JWT + HttpOnly Cookie rotation), Bean Validation, Flyway Migrations |
| **Frontend** | React 18, TypeScript, Vite, TanStack Query (React Query), Tailwind CSS, Lucide Icons, React Router v6 |
| **Database** | PostgreSQL 16 (ACID Relational Persistence, Pessimistic Locking on Inventory) |
| **Observability** | Spring Boot Actuator, Micrometer Prometheus metrics (`/actuator/prometheus`), Structured JSON Logging (MDC correlation `X-Request-ID`), Grafana |
| **DevOps & Infra**| Multi-stage Dockerfiles, Docker Compose, Kubernetes Manifests & Helm Charts, GitHub Actions CI/CD |
| **Testing** | JUnit 5, Mockito, Spring Boot Integration Tests, Multi-Threaded Concurrency Tests, JaCoCo Coverage Gate (>=80%) |

---

## 🚀 Quick Start (Docker Compose)

The fastest way to launch the complete system locally:

```bash
# 1. Clone the repository and start all services
docker compose up --build -d

# 2. Check service health
docker compose ps
```

### Accessing Local Services
- 🌐 **Web Application (Frontend)**: [http://localhost:3000](http://localhost:3000)
- 🔌 **REST API & Actuator (Backend)**: [http://localhost:8080](http://localhost:8080)
- 📖 **Interactive Swagger UI**: [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)
- 📊 **Prometheus Metrics**: [http://localhost:9090](http://localhost:9090)
- 📈 **Grafana Dashboards**: [http://localhost:3001](http://localhost:3001) *(admin / admin)*

---

## 🔑 Default Test Credentials

| Role | Username | Password | Access Capabilities |
|---|---|---|---|
| **ADMIN** | `admin` | `admin123` | Full system control, user accounts, catalog, circulation, audit trail |
| **LIBRARIAN** | `librarian` | `librarian123` | Book catalog CRUD, member registration, book checkouts & returns |
| **MEMBER** | `member` | `member123` | Catalog browsing, personal loans, borrowing history |

---

## 🧪 Running Tests & Quality Gates

### Backend Unit, API & Concurrency Tests
```bash
cd backend
./mvnw clean test verify
```
This executes:
- **Unit Tests**: Domain rules, token parsing, overdue calculations.
- **API Tests**: MockMvc endpoint verification, status codes, RBAC authorization rules.
- **Concurrency Integration Tests**: Verifies that 5 concurrent threads issuing a single remaining book copy only permits 1 checkout, avoiding negative copy counts via pessimistic database locking (`SELECT ... FOR UPDATE`).
- **JaCoCo Coverage**: HTML report generated at `backend/target/site/jacoco/index.html`.

### Frontend Build & Linting
```bash
cd frontend
npm install
npm run build
```

---

## 🗄️ Database Migrations (Flyway)

Database migrations run automatically during backend startup:
- `backend/src/main/resources/db/migration/V1__initial_schema.sql`: Complete normalized schema with constraints, foreign keys, and search indexes.
- `backend/src/main/resources/db/migration/V2__seed_dev_data.sql`: Seed data for development and testing.

---

## ☸️ Kubernetes & Helm Deployment

Deploy to production Kubernetes clusters using Helm:

```bash
# Lint Helm chart
helm lint deploy/helm/library-system

# Deploy to staging environment
helm upgrade --install library-system deploy/helm/library-system -f deploy/helm/library-system/values-staging.yaml

# Deploy to production environment
helm upgrade --install library-system deploy/helm/library-system -f deploy/helm/library-system/values-prod.yaml
```

---

## 📖 Architectural Documentation Index

Detailed architectural and operational documentation is located in the [`docs/`](file:///d:/LibraryManagementDevops/docs) directory:

- [System Architecture](file:///d:/LibraryManagementDevops/docs/architecture.md)
- [Domain Model & Entity Relations](file:///d:/LibraryManagementDevops/docs/domain-model.md)
- [REST API Specification](file:///d:/LibraryManagementDevops/docs/api.md)
- [Security Model & RBAC Matrix](file:///d:/LibraryManagementDevops/docs/security.md)
- [Testing Strategy](file:///d:/LibraryManagementDevops/docs/testing.md)
- [Deployment Strategy](file:///d:/LibraryManagementDevops/docs/deployment.md)
- [Operations & Observability Runbook](file:///d:/LibraryManagementDevops/docs/operations.md)
- [Git Branching Strategy](file:///d:/LibraryManagementDevops/docs/branching-strategy.md)
- [CI/CD Pipeline](file:///d:/LibraryManagementDevops/docs/ci-cd.md)
