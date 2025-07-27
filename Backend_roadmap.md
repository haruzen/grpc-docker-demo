# Proposed Development Roadmap

## PHASE 1: Get Authentication & User Flows Working

### Cognito Auth Code Grant (PKCE) Integration
- Use AWS Cognito Hosted UI for login.
- Use a backend proxy for `/oauth2/token` exchange (Node.js Express).
- Store tokens in frontend (securely).
- Use JWT access token for all backend API calls.

### User Task Management
- Secure `/tasks` API so it only returns tasks for the authenticated user.
- Add admin API endpoints for monitoring all users’ tasks.
- Add user profile endpoint (protected).

---

## PHASE 2: Modernize API Routing & Security

### API Gateway & JWT Validation
- Integrate AWS API Gateway for routing/protecting APIs.
- Use Cognito Authorizer to validate tokens at the gateway.
- Route `/tasks` requests to correct backend microservice.

### NGINX as a Reverse Proxy
- Serve frontend static files via NGINX.
- Route API requests to backend containers.
- Terminate HTTPS (add TLS/certbot for local/dev or ACM for prod).

---

## PHASE 3: Deployment, Automation, and Monitoring

### Dockerization
- Ensure all components have working Dockerfiles.
- Use Docker Compose for local development.
- *(Future: Prepare for Kubernetes or ECS/EKS if scaling.)*

### CI/CD and IaC
- Set up GitHub Actions or GitLab CI for automated builds, tests, and Docker image pushes.
- Use Ansible for server provisioning, Docker deployment, and NGINX config.
- *(Future: Add Terraform for full cloud infra management.)*

### Monitoring & Logging
- Centralize NGINX/microservice logs (stdout, ELK, or AWS CloudWatch).
- Add health endpoints and status checks.

---

## PHASE 4: Advanced and Scalability

### Role-based Access Control
- Use Cognito Groups/claims for admin/user roles.
- Secure admin endpoints.

### Scalability & Cloud Readiness
- Refactor Compose for ECS/EKS or Kubernetes.
- Use managed databases (AWS RDS, DynamoDB, etc.) if needed.

---

## Roadmap Table

| Phase | Step                    | Purpose/Goal                                   |
|-------|-------------------------|------------------------------------------------|
| 1     | Cognito PKCE Auth       | Secure, modern login & token handling          |
| 1     | Task API: user & admin  | Personal task lists & admin monitoring         |
| 2     | API Gateway/JWT validation | Centralize API routing, offload auth         |
| 2     | NGINX proxy/HTTPS       | Production-grade serving, security, and API routing |
| 3     | Dockerize everything    | Simplified development, reproducible deployments |
| 3     | CI/CD + Ansible         | Fully automated, consistent deployment & infra configuration |
| 3     | Monitoring/logs         | Observability, easier debugging                |
| 4     | RBAC, admin APIs        | Fine-grained security and admin controls       |
| 4     | Cloud scale, managed DBs| Cloud-native, scalable, lower maintenance      |
