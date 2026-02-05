import test from 'node:test';
import assert from 'node:assert';
import { buildApp } from '../app.js';

// test basique  et get le /heat
test('GET /health responds with ok', async () => {
  const app = await buildApp();

  const response = await app.inject({
    method: 'GET',
    url: '/health'
  });

  assert.strictEqual(response.statusCode, 200);
  const json = JSON.parse(response.body);
  assert.strictEqual(json.ok, true);

  await app.close();
});

// Test POST endpoint ça test le redirect
test('POST /quotes with empty text redirects to home', async () => {
  const app = await buildApp();

  const response = await app.inject({
    method: 'POST',
    url: '/quotes',
    payload: {
      author: 'Test Author',
      text: ''  // redirect
    },
    headers: {
      'content-type': 'application/x-www-form-urlencoded'
    }
  });

  assert.strictEqual(response.statusCode, 302, 'Should redirect');
  assert.strictEqual(response.headers.location, '/', 'Should redirect to home page');

  await app.close();
});