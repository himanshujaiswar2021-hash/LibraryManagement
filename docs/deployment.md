# Deployment Strategy: Local, Docker Compose & Kubernetes

## 1. Local Containerized Deployment (Docker Compose)

### 1.1 Compose Topology
The local stack spins up complete dependencies with health checks and persistence:
- `postgres`: PostgreSQL 16 on port 5432, with healthcheck `pg_isready` and persistent volume `pgdata`.
- `backend`: Spring Boot 3 app on port 8080, waiting for healthy Postgres.
- `frontend`: React SPA on port 3000, served via Nginx with API reverse proxy.
- `prometheus`: Scrapes metrics from `/actuator/prometheus` on port 9090.
- `grafana`: Pre-loaded dashboards on port 3001.

### 1.2 Quickstart Commands
```bash
# Start all services with fresh build
docker compose up --build -d

# Check service health
docker compose ps

# View backend logs in real-time
docker compose logs -f backend

# Stop all services and retain database volumes
docker compose down

# Complete teardown including volume reset
docker compose down -v
```

---

## 2. Production Kubernetes Deployment (Helm / Kustomize)

### 2.1 Manifest Architecture
```
deploy/
├── helm/
│   └── library-system/
│       ├── Chart.yaml
│       ├── values.yaml
│       ├── values-dev.yaml
│       ├── values-staging.yaml
│       ├── values-prod.yaml
│       └── templates/
│           ├── namespace.yaml
│           ├── backend-deployment.yaml
│           ├── backend-service.yaml
│           ├── frontend-deployment.yaml
│           ├── frontend-service.yaml
│           ├── ingress.yaml
│           ├── configmap.yaml
│           ├── secrets.yaml
│           ├── hpa.yaml
│           ├── pdb.yaml
│           ├── networkpolicy.yaml
│           └── migration-job.yaml
```

### 2.2 Production Hardening Features
- **Non-Root Execution**: `runAsNonRoot: true`, `runAsUser: 10001`.
- **Read-Only Root Filesystem**: `readOnlyRootFilesystem: true` with ephemeral `tmpfs` mounts for `/tmp`.
- **Capability Dropping**: `drop: ["ALL"]`.
- **Probes**:
  - `startupProbe`: `/actuator/health/liveness` with generous failure threshold (30 x 2s = 60s) for JVM warmup.
  - `livenessProbe`: `/actuator/health/liveness` every 10s.
  - `readinessProbe`: `/actuator/health/readiness` every 5s.
- **Resource Constraints**: Explicit CPU/Memory requests and limits preventing noisy neighbors.
- **Auto-scaling**: HPA scaling backend pods between 2 and 10 replicas based on 75% CPU and memory utilization.
- **High Availability**: Pod Disruption Budget requiring `minAvailable: 1`.
- **Zero-Downtime Rollouts**: RollingUpdate strategy with `maxUnavailable: 0` and `maxSurge: 1`.

---

## 3. Database Migration Strategy in Kubernetes

1. **Pre-Deployment Migration Job**: Before rolling update of backend pods, a dedicated Kubernetes `Job` runs Flyway migration against the database.
2. **Backward-Compatible Migrations**: Schema migrations follow expand/contract patterns to allow old and new backend pods to operate simultaneously during the rolling rollout.
