// SPDX-License-Identifier: BSD-3-Clause

import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  JS,
  getNetworkIP,
  patchElementsFrame,
  patchSignalsFrame,
} from '../lib/js/js.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(
  readFileSync(path.join(__dirname, '../package.json'), 'utf8'),
);

/** Start a JS server on an ephemeral port and return its base URL + closer. */
function startServer(configure) {
  const js = new JS();
  js.CONFIG.HTTPWS_PORT = 0; // ephemeral
  if (configure) configure(js);
  js.create();
  return new Promise((resolve) => {
    js.listenHttpWS('127.0.0.1');
    js.server.once('listening', () => {
      const { port } = js.server.address();
      resolve({
        js,
        base: `http://127.0.0.1:${port}`,
        close: () =>
          new Promise((r) => {
            js.close(r);
          }),
      });
    });
  });
}

describe('JS.CONFIG defaults', () => {
  const js = new JS();

  test('DOCROOT defaults to the bundled examples directory (absolute)', () => {
    assert.ok(path.isAbsolute(js.CONFIG.DOCROOT));
    assert.equal(path.basename(js.CONFIG.DOCROOT), 'examples');
  });

  test('HTTPWS_PORT defaults to 8000', () => {
    assert.equal(js.CONFIG.HTTPWS_PORT, 8000);
  });

  test('LISTEN_ON_ADDRESS is set', () => {
    assert.equal(js.CONFIG.LISTEN_ON_ADDRESS, '0.0.0.0');
  });

  test('VERSION_TAG tracks package.json version', () => {
    assert.equal(js.CONFIG.VERSION_TAG, pkg.version);
  });

  test('VERSION_DESCRIPTION default', () => {
    assert.equal(
      js.CONFIG.VERSION_DESCRIPTION,
      'NPM package for Jumbosocket, affectionately known as JS.js',
    );
  });
});

describe('Datastar SSE framing', () => {
  test('patchElementsFrame emits a well-formed event', () => {
    const frame = patchElementsFrame('<div>hi</div>', {
      selector: '#count',
      mode: 'inner',
    });
    assert.equal(
      frame,
      'event: datastar-patch-elements\n' +
        'data: selector #count\n' +
        'data: mode inner\n' +
        'data: elements <div>hi</div>\n' +
        '\n',
    );
  });

  test('patchElementsFrame splits multi-line markup into data lines', () => {
    const frame = patchElementsFrame('<ul>\n<li>a</li>\n</ul>');
    assert.ok(frame.includes('data: elements <ul>\n'));
    assert.ok(frame.includes('data: elements <li>a</li>\n'));
    assert.ok(frame.includes('data: elements </ul>\n'));
  });

  test('patchSignalsFrame serializes signals as JSON', () => {
    const frame = patchSignalsFrame({ count: 2 });
    assert.equal(
      frame,
      'event: datastar-patch-signals\ndata: signals {"count":2}\n\n',
    );
  });
});

describe('getNetworkIP', () => {
  test('returns null or a dotted IPv4 string', () => {
    const ip = getNetworkIP();
    assert.ok(ip === null || /^\d+\.\d+\.\d+\.\d+$/.test(ip));
  });
});

describe('static file security', () => {
  test('staticHandler refuses to escape DOCROOT via ..', () => {
    const js = new JS();
    const handler = js.staticHandler('../package.json');
    let status;
    const res = {
      writeHead(code) {
        status = code;
        return this;
      },
      end() {},
    };
    handler({ method: 'GET', url: '/../package.json' }, res);
    assert.equal(status, 404);
  });
});

describe('HTTP routing', () => {
  let server;
  before(async () => {
    server = await startServer((js) => {
      js.get('/helloworld', (req, res) => res.simpleText(200, 'hello world'));
    });
  });
  after(() => server.close());

  test('exact route responds', async () => {
    const r = await fetch(`${server.base}/helloworld`);
    assert.equal(r.status, 200);
    assert.equal(await r.text(), 'hello world');
  });

  test('/about reports the package version', async () => {
    const r = await fetch(`${server.base}/about`);
    assert.equal(r.status, 200);
    assert.ok((await r.text()).startsWith(pkg.version));
  });

  test('unknown route is 404', async () => {
    const r = await fetch(`${server.base}/nope`);
    assert.equal(r.status, 404);
  });

  test('unsupported method is 501', async () => {
    const r = await fetch(`${server.base}/helloworld`, { method: 'DELETE' });
    assert.equal(r.status, 501);
  });

  test('serves the static index.html', async () => {
    const r = await fetch(`${server.base}/`);
    assert.equal(r.status, 200);
    assert.match(r.headers.get('content-type'), /text\/html/);
    assert.match(await r.text(), /Jumbosocket/);
  });

  test('blocks path traversal on static routes', async () => {
    const r = await fetch(`${server.base}/css/..%2f..%2fpackage.json`);
    assert.equal(r.status, 404);
  });
});

describe('SSE endpoint', () => {
  let server;
  before(async () => {
    server = await startServer((js) => {
      js.get('/stream', (req, res) => {
        const stream = js.sse(req, res);
        stream.patchElements('42', { selector: '#count', mode: 'inner' });
      });
    });
  });
  after(() => server.close());

  test('streams a datastar patch over text/event-stream', async () => {
    const ac = new AbortController();
    const r = await fetch(`${server.base}/stream`, { signal: ac.signal });
    assert.equal(r.status, 200);
    assert.match(r.headers.get('content-type'), /text\/event-stream/);

    const reader = r.body.getReader();
    let received = '';
    for (
      let i = 0;
      i < 5 && !received.includes('datastar-patch-elements');
      i++
    ) {
      const { value, done } = await reader.read();
      if (done) break;
      received += Buffer.from(value).toString('utf8');
    }
    ac.abort();
    assert.ok(received.includes('datastar-patch-elements'));
    assert.ok(received.includes('data: elements 42'));
  });
});
