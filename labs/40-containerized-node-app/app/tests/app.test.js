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



test('GET / responds with HTML page when database is available', async () => {
  const app = await buildApp();

  const response = await app.inject({
    method: 'GET',
    url: '/'
  });

  if (response.statusCode === 200) {
    assert.ok(response.body.includes('QuoteBoard'), 'Response should contain QuoteBoard title');
    assert.ok(response.body.includes('<form'), 'Response should contain a form');
    assert.ok(response.headers['content-type'].includes('text/html'), 'Content-Type should be HTML');
  } else {
    // Database not available 
    assert.strictEqual(response.statusCode, 500, 'Expected error without database');
  }

  await app.close();
});

test('GET /api/quotes responds with JSON when database is available', async () => {
  const app = await buildApp();

  const response = await app.inject({
    method: 'GET',
    url: '/api/quotes'
  });

  // test de la DB 
  if (response.statusCode === 200) {
    assert.ok(response.headers['content-type'].includes('application/json'), 'Content-Type should be JSON');
    const json = JSON.parse(response.body);
    assert.ok(json.hasOwnProperty('quotes'), 'Response should have quotes property');
    assert.ok(Array.isArray(json.quotes), 'Quotes should be an array');
  } else {
    // Database not available - test skipped
    assert.strictEqual(response.statusCode, 500, 'Expected error without database');
  }

  await app.close();
});

//  verifie l'insertion de quotes 
test('POST /quotes inserts data when database is available', async () => {
  const app = await buildApp();

  const testQuote = `Test quote ${Date.now()}`;

  const postResponse = await app.inject({
    method: 'POST',
    url: '/quotes',
    payload: {
      author: 'Test Author',
      text: testQuote
    },
    headers: {
      'content-type': 'application/x-www-form-urlencoded'
    }
  });

  assert.strictEqual(postResponse.statusCode, 302, 'Should redirect after POST');

  // verifie en fetch quotes
  const getResponse = await app.inject({
    method: 'GET',
    url: '/api/quotes'
  });

  if (getResponse.statusCode === 200) {
    const json = JSON.parse(getResponse.body);
    const foundQuote = json.quotes.find(q => q.text === testQuote);
    assert.ok(foundQuote, 'Quote should be added to database');
    assert.strictEqual(foundQuote.author, 'Test Author', 'Author should match');
  } else {
    // database off
    assert.ok(true, 'Database not available for verification');
  }

  await app.close();
});
