import test from 'node:test';
import assert from 'node:assert/strict';
import { calendarDate, notPastAnywhere, readObject, createRateLimit } from '../lib/request.ts';

const req = (body, headers = {}) => new Request('https://www.exjet.com/api/requests/', { method: 'POST', body, headers: { 'Content-Type': 'application/json', ...headers } });
test('calendar dates reject rollover, invalid months and malformed input', () => {
  for (const value of ['2026-02-30', '2026-02-29', '2026-13-01', '2026-00-01', '2026-1-01', 'not-a-date']) assert.equal(calendarDate(value), false, value);
  assert.equal(calendarDate('2028-02-29'), true);
});
test('airport-local today is accepted across the UTC boundary but old dates are rejected', () => {
  const now = Date.parse('2026-10-20T01:00:00Z');
  assert.equal(notPastAnywhere('2026-10-19', now), true);
  assert.equal(notPastAnywhere('2026-10-18', now), false);
});
test('null, arrays and scalar JSON cannot reach object field access', async () => {
  for (const input of ['null', '[]', '1', '"hello"', '{']) await assert.rejects(readObject(req(input)), error => error.status === 400);
  assert.deepEqual(await readObject(req('{"date":"2026-10-20"}')), {date: '2026-10-20'});
});
test('intake rejects cross-origin, unsupported content types and oversized streams', async () => {
  await assert.rejects(readObject(req('{}', {Origin: 'https://other.example'})), error => error.status === 403);
  await assert.rejects(readObject(req('{}', {'Content-Type': 'text/plain'})), error => error.status === 415);
  await assert.rejects(readObject(req(JSON.stringify({notes: 'a'.repeat(24000)}))), error => error.status === 413);
  assert.deepEqual(await readObject(req('{}', {Origin: 'https://www.exjet.com'})), {});
});
test('request backstop blocks excess attempts and expires its window', () => {
  const limit = createRateLimit(2, 1000), request = req('{}', {'x-forwarded-for': '192.0.2.1'});
  assert.equal(limit(request, 100), false); assert.equal(limit(request, 101), false);
  assert.equal(limit(request, 102), true); assert.equal(limit(request, 1100), false);
});
