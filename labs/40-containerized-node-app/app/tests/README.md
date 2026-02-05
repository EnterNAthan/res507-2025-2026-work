# Automated Tests

This directory contains automated tests for the QuoteBoard application using Node.js built-in testing framework and Fastify's `inject` method.

## Running Tests

### Basic Test Run (without database)

Tests can run without a database connection. Database-dependent tests will gracefully handle connection failures:

```bash
npm test
```

### Running Tests with Database

To run tests with full database integration:

1. Start the Docker Compose stack:
   ```bash
   cd ..
   docker compose -f ../docker/compose.yaml up -d
   ```

2. Run tests with the DATABASE_URL environment variable:
   ```bash
   DATABASE_URL=postgres://postgres:postgres@localhost:5433/postgres npm test
   ```

   Note: The database is exposed on port 5433 (not the default 5432) to avoid conflicts with local PostgreSQL installations.

## Test Structure

The test suite includes:

1. **Health Check Test** - Validates the `/health` endpoint (no database required)
2. **Form Validation Test** - Tests redirect behavior for empty form submissions
3. **HTML Page Test** - Verifies the main page renders correctly (requires database)
4. **JSON API Test** - Validates the `/api/quotes` endpoint (requires database)
5. **Data Persistence Test** - Confirms quotes are inserted into the database (requires database)

## Test Philosophy

Tests are designed to:
- Run in-memory using Fastify's `inject` method
- Handle database unavailability gracefully
- Validate both success and error paths
- Test application logic independent of infrastructure when possible

## Extending Tests

To add new tests:

1. Import the test framework:
   ```javascript
   import test from 'node:test';
   import assert from 'node:assert';
   import { buildApp } from '../app.js';
   ```

2. Create a test:
   ```javascript
   test('description of test', async () => {
     const app = await buildApp();

     const response = await app.inject({
       method: 'GET',
       url: '/your-route'
     });

     assert.strictEqual(response.statusCode, 200);

     await app.close();
   });
   ```

3. Always close the app instance with `await app.close()` to prevent memory leaks

## Running a Single Test File

```bash
node --test tests/app.test.js
```

## Continuous Integration

Tests run automatically in CI/CD pipelines without database dependencies, validating application logic and error handling.
