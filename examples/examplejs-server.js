// SPDX-License-Identifier: BSD-3-Clause
//
// Run from this directory:
//   > node ./examplejs-server.js
// then open http://localhost:8000/
//
// It serves the static assets in ./ and demonstrates Datastar over SSE:
//   - a server-pushed clock (broadcast to every connected browser)
//   - a shared counter button (@get('/increment') updates everyone live)

import { JS } from '../index.js';

const js = new JS();
js.CONFIG.DOCROOT = import.meta.dirname; // serve assets next to this file

let count = 0;

js.create(js.address, js.CONFIG.HTTPWS_PORT);

// Long-lived SSE stream. Datastar opens this via `data-init="@get('/stream')"`.
js.get('/stream', (req, res) => {
  const stream = js.sse(req, res);
  // Send current state immediately so a fresh client isn't blank.
  stream.patchElements(currentTime(), { selector: '#clock', mode: 'inner' });
  stream.patchElements(String(count), { selector: '#count', mode: 'inner' });
});

// Button action: bump the shared counter and push it to every client.
js.get('/increment', (req, res) => {
  count += 1;
  js.broadcastElements(String(count), { selector: '#count', mode: 'inner' });
  res.writeHead(204).end(); // nothing to patch on the requesting connection
});

// A plain routed endpoint (exact match).
js.get('/helloworld', (req, res) => res.simpleText(200, 'hello world'));

// A regex route: /helloworldly/<anything-wordish>
js.getterer('/helloworldly/[\\w.\\-]+', (req, res) => {
  const route = new URL(req.url, 'http://localhost').pathname.split('/')[2];
  res.simpleText(200, `helloworldly on route ${route}`);
});

js.listenHttpWS();

// One server-side timer broadcasts the clock to all clients — created once,
// not per-connection, and cleared on shutdown (fixes the old timer leak).
const clock = setInterval(() => {
  js.broadcastElements(currentTime(), { selector: '#clock', mode: 'inner' });
}, 1000);

function currentTime() {
  return new Date().toLocaleTimeString();
}

function shutdown() {
  clearInterval(clock);
  js.close(() => process.exit(0));
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
