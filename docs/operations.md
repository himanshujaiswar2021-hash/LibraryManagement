# Operations, Observability & Maintenance Runbook

## 1. Monitoring & Observability

### 1.1 Metrics (Micrometer / Prometheus)
The backend exposes metrics at `/actuator/prometheus`.
Key metrics monitored:
- `http.server.requests`: Request rate, error rates (4xx, 5xx), and P95/P99 latency.
- `jvm.memory.used` / `jvm.gc.pause`: Heap allocation and garbage collection telemetry.
- `hikaricp.connections.active` / `hikaricp.connections.pending`: Database connection pool utilization.
- `library.loans.issued.total`: Counter of loans issued.
- `library.loans.returned.total`: Counter of loans returned.
- `library.loans.overdue.current`: Gauge of active overdue loans.
- `library.books.available.copies`: Gauge of currently available copies across catalog.

### 1.2 Centralized Logging
- Formatted as JSON according to Elastic Common Schema (ECS) / Logstash standards.
- Every log message contains:
  - `timestamp`: ISO-8601 UTC.
  - `level`: `INFO`, `WARN`, `ERROR`, `DEBUG`.
  - `requestId`: Distributed tracing / correlation ID propagated from HTTP header `X-Request-ID`.
  - `userId` / `username`: Authenticated user context.
  - `logger`: Class name.
  - `message`: Contextual message.
  - `stack_trace`: Formatted stack trace on exceptions.

---

## 2. Health Checks & Probes

| Probe Type | Endpoint | Expected Status | Action on Failure |
|---|---|---|---|
| **Liveness** | `/actuator/health/liveness` | `200 OK {"status": "UP"}` | Container restarted by Kubernetes |
| **Readiness** | `/actuator/health/readiness` | `200 OK {"status": "UP"}` | Pod removed from traffic routing |
| **Startup** | `/actuator/health/liveness` | `200 OK {"status": "UP"}` | Waits up to 60s before marking startup failure |

---

## 3. Operational Runbooks & Troubleshooting

### 3.1 Database Backup & Restore
- **Backup**:
  ```bash
  pg_dump -U postgres -d librarydb -F c -b -v -f /backups/librarydb_$(date +%Y%m%d_%H%M%S).dump
  ```
- **Restore**:
  ```bash
  pg_restore -U postgres -d librarydb -v -c /backups/librarydb_20261001_000000.dump
  ```

### 3.2 Database Reset for Local Development
- Re-run Flyway clean & migrate or recreate the Docker Compose postgres volume:
  ```bash
  docker compose down -v
  docker compose up -d postgres
  ```

### 3.3 Handling High Database Pool Contention
If `hikaricp.connections.pending > 5`:
1. Check slow query logs in PostgreSQL.
2. Verify if locks on `books` or `loans` table are held by long-running transactions.
3. Scale backend pool size in `application.yml` via `SPRING_DATASOURCE_HIKARI_MAXIMUM_POOL_SIZE`.
