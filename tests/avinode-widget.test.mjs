import test from 'node:test';
import assert from 'node:assert/strict';
import { widgetResponse } from '../integration/avinode/widget.ts';

const request = new Request('https://exjet.test/api/avinode/widget/');
const configured = 'https://apps.avinode.com/webapp/rest/bootstrap?Avinode-WEB-APP=fixture-public-widget';

test('the hosted widget works without REST credentials and restricts script and frame origins', async () => {
  const response = widgetResponse(request, configured);
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('Cache-Control'), 'private, no-store');
  assert.match(response.headers.get('Content-Security-Policy'), /frame-src https:\/\/apps\.avinode\.com;/);
  const html = await response.text();
  assert.ok(html.includes(configured));
  assert.ok(html.includes('id="avinodeApp"'));
  assert.ok(!html.includes('AVINODE_AUTH_TOKEN'));
  assert.ok(!html.includes('X-Avinode-ApiToken'));
  assert.equal(await widgetResponse(new Request(request.url, { method: 'HEAD' }), configured).text(), '');
});

test('untrusted loader URLs fail explicitly without emitting their scripts', async () => {
  for (const value of ['', 'https://evil.example/bootstrap', 'https://apps.avinode.com.evil.example/webapp/rest/bootstrap?Avinode-WEB-APP=x', 'https://apps.avinode.com/api/searches', 'https://user:pass@apps.avinode.com/webapp/rest/bootstrap?Avinode-WEB-APP=x']) {
    const response = widgetResponse(request, value);
    assert.equal(response.status, 503);
    const html = await response.text();
    assert.ok(!html.includes('document.createElement'));
    assert.ok(html.includes('status:"error"'));
  }
  assert.equal(widgetResponse(new Request(request.url, { method: 'POST' }), configured).status, 405);
});
