# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This is the lab workspace for the RES507 DevOps course. The repository contains hands-on exercises organized into individual lab directories. The course website (devops.codyfactory.eu) is the authoritative source for all lab instructions.

## Repository Structure

- `labs/` - Individual lab directories, each self-contained with its own README
  - `01-welcome/` - Introduction lab
  - `20-git-foundation/` - Git fundamentals
  - `40-containerized-node-app/` - Docker and containerization lab
- `workspace/` - Shared working area used across multiple labs
- `scripts/` - Helper scripts (e.g., `ci-preview.sh` for CI automation)
- `.github/workflows/` - GitHub Actions CI/CD pipelines

## Lab 40: Containerized Node Application

This lab demonstrates containerization concepts with a Fastify-based Node.js application and PostgreSQL database.

### Application Architecture

The application in `labs/40-containerized-node-app/` follows this structure:

- **app/** - Fastify web application
  - `server.js` - Entry point that starts the server
  - `app.js` - Application builder with route definitions and plugin registration
  - `views/` - Handlebars templates
  - Uses ES modules (`"type": "module"` in package.json)

- **db/** - Database layer
  - `init.sql` - PostgreSQL schema and seed data for the `quotes` table

- **docker/** - Containerization configuration
  - `Dockerfile` - Multi-stage build with dependency caching
  - `compose.yaml` - Orchestrates app and PostgreSQL services

### Key Configuration Patterns

The application is designed to be environment-agnostic and can start without a database connection:

- `DATABASE_URL` - PostgreSQL connection string (defaults to localhost)
- `PORT` - Server port (default: 3000)
- `HOST` - Bind address (default: 0.0.0.0)

Database queries in `app.js` may be commented out during lab exercises - this is intentional for step-by-step learning.

### Common Development Commands

#### Lab 40 - Local Development (without Docker)
```bash
cd labs/40-containerized-node-app/app
npm install
npm run dev    # Development with auto-reload
npm start      # Production mode
```

#### Lab 40 - Docker Workflow
```bash
cd labs/40-containerized-node-app

# Build image manually
docker build -t quote-app -f docker/Dockerfile .

# Run application container only
docker run --rm -it -p 3000:3000 quote-app

# Run PostgreSQL database only
docker run --rm \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=postgres \
  -p 5432:5432 \
  postgres:18

# Full stack with Docker Compose
docker compose -f docker/compose.yaml up --build
docker compose -f docker/compose.yaml down
docker compose -f docker/compose.yaml logs app
docker compose -f docker/compose.yaml logs db
docker compose -f docker/compose.yaml ps

# Rebuild after code changes
docker compose -f docker/compose.yaml build
```

#### Debugging and Inspection
```bash
# Interactive shell inside container
docker run --rm -it quote-app sh

# View running containers
docker ps

# View built images
docker images
```

### Important Notes for Lab 40

- The Dockerfile uses `npm ci` instead of `npm install` for reproducible builds
- The compose.yaml includes a health check for the database to ensure proper startup order
- The `db` volume persists PostgreSQL data between restarts
- The application expects queries to be uncommented during the lab exercises
- Database initialization happens automatically via `/docker-entrypoint-initdb.d/init.sql`

## CI/CD Pipeline

The repository includes a GitHub Actions workflow (`.github/workflows/ci.yml`) that runs `scripts/ci-preview.sh` on every push. This script is used for automated validation during the course.

## Working Philosophy

This is a learning repository where:
- Mistakes are expected and encouraged as part of the learning process
- Starting fresh by deleting and re-cloning is always acceptable
- Each lab is self-contained and can be worked on independently
- Focus is on understanding concepts, not speed or perfection
