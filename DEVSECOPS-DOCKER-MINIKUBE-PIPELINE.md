# DevSecOps pipeline: Docker and Minikube

The GitHub Actions workflow now runs application syntax validation and Trivy scanning, builds and health-checks the Document Converter and Font Compiler with Docker Compose, then builds those same service images inside Minikube and verifies Kubernetes rollout and health endpoints.

The Cloudflare Worker/static frontend is not converted into a Kubernetes workload by this pipeline. It remains deployed through the existing Cloudflare Workers deployment process. D1, R2, secrets, uploaded user documents, and production data are not copied into these container images.

The Docker and Minikube jobs are CI smoke tests only. They do not deploy to production or migrate databases/storage. Production deployment remains a separate, explicit step after the pull request and checks are reviewed.
