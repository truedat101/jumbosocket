# Jumbosocket

> A small, dependency-free hypermedia server for big ideas.

Jumbosocket is a boilerplate quickstart for a Node.js server that does HTTP
routing, static file serving, and **real-time UI updates over Server-Sent
Events using [Datastar](https://data-star.dev)**. The whole core is one small,
readable file with **zero runtime dependencies** — you can walk through every
line and understand exactly what the server is doing. No framework to learn,
no build step.

> **Heads up — v0.3 is a rewrite.** Jumbosocket used to be a `socket.io`
> ping/pong demo. It is now an ESM, Node 24+, Datastar/SSE hypermedia server.
> `socket.io` has been removed entirely. See the release notes below.

## Design goals

- Deliverable as an NPM package; consumers `import { JS } from 'js.js'`
- Easy to add your own routes (exact match and regex)
- Sensible defaults — minimal configuration to get going
- Serve static **and** server-driven dynamic content without adopting opinions
  about your directory layout
- Small enough to read end-to-end

## Requirements

- **Node.js 24 or greater** (ESM, `import.meta.dirname`)
- That's it — no runtime dependencies.

## Installation

```sh
npm install js.js
```

## Usage

```js
import { JS } from 'js.js';

const js = new JS();
js.create(); // build the HTTP server + default routes

// A plain route
js.get('/helloworld', (req, res) => res.simpleText(200, 'hello world'));

// A regex route
js.getterer('/greet/[\\w.\\-]+', (req, res) => {
  const who = new URL(req.url, 'http://localhost').pathname.split('/')[2];
  res.simpleText(200, `hello, ${who}`);
});

js.listenHttpWS(); // listen on CONFIG.HTTPWS_PORT (default 8000)
```

### Real-time UI with Datastar (SSE)

The backend drives the frontend by streaming Datastar
[`datastar-patch-elements`](https://data-star.dev/reference/sse_events) and
`datastar-patch-signals` events. On the page:

```html
<script
  type="module"
  src="https://cdn.jsdelivr.net/gh/starfederation/[email protected]/bundles/datastar.js"
></script>

<body data-init="@get('/stream')">
  <p id="clock">connecting…</p>
  <p id="count">0</p>
  <button data-on:click="@get('/increment')">+1</button>
</body>
```

On the server:

```js
// Long-lived stream, opened by data-init="@get('/stream')"
js.get('/stream', (req, res) => {
  const stream = js.sse(req, res); // registers the client for broadcast
  stream.patchElements(String(count), { selector: '#count', mode: 'inner' });
});

// Push to every connected browser at once
js.broadcastElements(html, { selector: '#count', mode: 'inner' });
js.broadcastSignals({ count });
```

`js.sse(req, res)` returns `{ patchElements, patchSignals, close }` scoped to
that one client; `js.broadcastElements` / `js.broadcastSignals` fan out to all
open streams.

## Run the demo

```sh
npm start          # or: node examples/examplejs-server.js
# open http://localhost:8000/
```

The demo shows a server-pushed clock and a **shared counter** — click `+1` in
one browser tab and every connected tab updates live.

## Configure

`js.CONFIG` holds the defaults; override before calling `create()`:

| Key                 | Default                     | Meaning                      |
| ------------------- | --------------------------- | ---------------------------- |
| `HTTPWS_PORT`       | `8000`                      | listen port                  |
| `LISTEN_ON_ADDRESS` | `0.0.0.0`                   | bind address                 |
| `DOCROOT`           | the bundled `examples/` dir | static file root (sandboxed) |
| `VERSION_TAG`       | from `package.json`         | reported by `/about`         |

Static serving is sandboxed to `DOCROOT`; `..` traversal is rejected with 404.

## Demo routes (port 8000)

- `/` — the Datastar demo page
- `/stream` — long-lived SSE stream (clock + counter)
- `/increment` — bump the shared counter, broadcast to all clients
- `/helloworld` — plain text route
- `/helloworldly/<path>` — regex route, echoes `<path>`
- `/about` — version + description

## Development

```sh
npm test     # node:test built-in runner
npm run lint # eslint (flat config) + prettier compatibility
npm run format
```

CI runs lint + tests + `npm audit` on Node 22 and 24 (see
`.github/workflows/ci.yml`).

## Release Notes

### v0.3.0

- **Breaking:** removed `socket.io`; real-time is now Datastar over SSE.
- **Breaking:** converted to ESM (`import`/`export`); requires Node.js ≥ 24.
- Zero runtime dependencies; eliminated the Grunt/Karma/JSHint/Mocha toolchain
  (cleared all 41 prior `npm audit` findings).
- Added Datastar SSE helpers: `sse()`, `patchElements`/`patchSignals`,
  `broadcastElements`/`broadcastSignals`.
- Hardened static file serving against path traversal.
- Fixed several long-standing bugs: `os.networkInterfaces()` IP resolution,
  per-connection timer leak, `Content-Length` byte length, instance state
  (no more constructor-statics singleton), and removed dead `ifconfig` helpers.
- Tests rewritten on `node:test`; added routing/SSE/security coverage.

### v0.2.2

- Some metadata cleanup

### v0.2.1

- migrate to node v20
- remove excess dependencies

### v0.1.x and earlier

- See git history. Highlights: NPM packaging (v0.1.0), DOCROOT handling
  (v0.1.7–v0.1.19), `os.networkInterfaces()` IP work (v0.1.16–v0.1.17).

## Attributions

- Node.js — Ryan Dahl, for the runtime
- node_chat / `fu.js` — original inspiration for `js.js`
- [Datastar](https://data-star.dev) — the hypermedia framework powering the SSE UI
- JavaScript — Brendan Eich
- Tatsumaki (Perl/Plack) — early inspiration
