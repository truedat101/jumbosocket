# Jumbosocket Modernization & Code-Quality Plan

_Generated 2026-06-18. Target: bring `jumbosocket` (npm name `js.js`, v0.2.3) up to the
latest supported Node.js LTS and modern JS practices, with a deep code-quality cleanup._

---

## 1. Executive Summary

`jumbosocket` is a small HTTP + socket.io boilerplate server. The core is a single
~700-line file (`lib/js/js.js`) written in pre-ES6 style (ES5 `var`, CommonJS, callback
control flow). The current state has real problems:

- **Security:** `npm audit` reports **41 vulnerabilities (2 critical, 17 high, 18 moderate, 4 low)**, almost entirely in the legacy Grunt/Karma/JSHint dev-tool tree.
- **Tests fail:** `npm test` → **2 of 5 tests fail** because the test expectations are stale (wrong `DOCROOT`, hard-coded old version `0.1.18`).
- **Latent bugs:** several runtime bugs in core (see §4) — e.g. `os.networkInterfaces` referenced but never called, `console.err` typo, `self` used where undefined, implicit global `DEBUG`.
- **Dead/deprecated tooling:** Grunt + JSHint + QUnit + Karma + grunt-bump — a heavy, vulnerable, unused build chain for what is effectively one source file.
- **Node target:** `engines.node` is `^20.0.0`. **Node 20 reaches end-of-life in April 2026** (i.e. already EOL). Must move to a supported line.

The good news: the surface area is tiny, so a focused modernization is low-risk and high-value.

---

## 2. Target Runtime & Tooling

| Concern       | Current                                                 | Target                                                         |
| ------------- | ------------------------------------------------------- | -------------------------------------------------------------- |
| Node.js       | `^20` (EOL Apr 2026)                                    | **Node 24 LTS** (`>=24`), floor of `>=22` acceptable if needed |
| Module system | CommonJS (`require`/`exports`)                          | ESM (`import`/`export`) with `"type": "module"`                |
| Lint          | JSHint (deprecated)                                     | **ESLint 9** (flat config) + Prettier                          |
| Build         | Grunt (concat/uglify/bump/karma/...)                    | Remove entirely — no build step needed; use `npm` scripts      |
| Test runner   | Mocha + chai + sinon + sandboxed-module + QUnit + Karma | **node:test** + `node:assert` (built-in), drop the rest        |
| socket.io     | 4.8.0                                                   | 4.8.x latest (server already on v4 API)                        |
| CI            | none                                                    | GitHub Actions matrix (Node 22 + 24)                           |
| Pin Node      | none                                                    | add `.nvmrc` + `engines`                                       |

**Why Node 24 LTS:** it is the active LTS line in 2026; Node 20 is EOL and Node 22 enters
maintenance. Targeting 24 (with 22 still passing CI) gives the longest support window.

**Why drop Grunt/Karma:** They are the source of essentially all 41 audit findings, and the
project produces no bundle that needs them (it's a server-side lib). `node:test` ships with
Node and removes mocha/chai/sinon/karma/qunit and their vulnerable transitive deps.

---

## 3. Deep Code-Quality Findings (`lib/js/js.js`)

### Correctness bugs (fix regardless of modernization)

1. **`getNetworkIP3` never calls `networkInterfaces()`** — line ~497 does `ips = os.networkInterfaces;` (a function reference) then iterates it as data. The `for…in` finds nothing, so the `0.0.0.0` → real-IP resolution silently never works. Should be `os.networkInterfaces()`.
2. **`console.err` is not a function** — line ~694 (`defaultJSHandler`) calls `console.err("empty message")`, which throws `TypeError`. Should be `console.error`.
3. **`self` is undefined in `listenSocketIO`** — the `catch` block pushes to `self.MSGS` but `self`/`this` is never bound in that method (it uses the `JS` constructor statics). Will throw `ReferenceError` exactly when handling an error.
4. **Implicit global `DEBUG`** — line ~79 `DEBUG = true;` (no `var`/`const`) leaks a global and is fragile under strict mode/ESM. Make it a module const or env-driven (`process.env.NODE_ENV`).
5. **`Content-Length` uses `String.length`** — multiple handlers set `Content-Length: body.length`. For multibyte bodies this is wrong; use `Buffer.byteLength(body)`.
6. **Singleton-via-constructor confusion** — methods mutate `JS.server` / `JS.io` / `JS.address` (statics on the constructor function) while the constructor sets `this.server`. Only one server instance can ever work, and `this` vs `JS` is inconsistent. Refactor to per-instance state (`this.server`, `this.io`).
7. **Unbounded `setInterval` in `defaultJSHandler`** — a new 10s broadcast timer is created on **every** connection and never cleared → memory/timer leak. Tie it to the socket lifecycle or remove from the default handler.
8. **Empty statement `this.server;`** in constructor (line ~71) is a no-op.

### Deprecations / modernization

9. **`url.parse()` is deprecated** — replace with the WHATWG `URL` API (`new URL(req.url, base)`), used in routing and `getterer`.
10. **Custom `extname()`** duplicates `path.extname` — drop it.
11. **ES5 `var` everywhere, mixed tabs/spaces** — convert to `const`/`let`, arrow functions where sensible, consistent formatting (Prettier).
12. **Callback-style `fs.readFile` / IP lookup** — migrate to `fs/promises` and async/await; collapse the three near-duplicate `getNetworkIP` / `getNetworkIP2` / `getNetworkIP3` into one `os.networkInterfaces()`-based helper (the two `ifconfig`-shelling versions are dead and platform-fragile — delete them).
13. **License header duplicated** in every file (~30 lines each) — move to top-level `LICENSE` file, keep a one-line SPDX tag in sources.
14. **Repeated handler boilerplate** (`writeHead`/`write`/`end`) — extract a small response helper (the code already half-does this with `res.simpleText`/`res.simpleJSON`).
15. **Stale `// XXX` / commented-out code** scattered throughout — resolve or remove.

---

## 4. Tests

`npm test` currently fails:

- `DOCROOT` test expects `process.cwd() + "/static"` but code sets `__dirname/../../examples`.
- `VERSION_TAG` test hard-codes `'0.1.18'`; code reads `pkgjson.version` (now `0.2.3`).

Plan:

- Rewrite `test/testjsinterface.js` against **`node:test` + `node:assert`**.
- Fix expectations to match intended behavior (assert `VERSION_TAG === pkg.version`, assert the real default `DOCROOT`).
- Add coverage for the bugs above: IP resolution, routing (exact + regex via `getterer`), 404/501/500 handlers, static file serving, and a socket.io connect/echo round-trip.

---

## 5. Dependency Actions

- **Remove** (dev): grunt + all `grunt-*`, karma + `karma-*`, qunit, jshint, chai, sinon, sandboxed-module, mocha, grunt-bump. → eliminates the vulnerable tree.
- **Keep** (prod): `socket.io` (bump to latest 4.8.x).
- **Add** (dev): `eslint`, `prettier`, `eslint-config-prettier` (no test-runner dep needed — `node:test` is built in).
- Regenerate `package-lock.json` from scratch; target **0 high/critical** in `npm audit`.
- Bump example client assets (jQuery 2.2.4, Modernizr 2.8.3) or document them as demo-only / replace with vanilla JS.

---

## 6. `package.json` Changes

- `engines.node`: `">=22"` (recommend `>=24`).
- Add `"type": "module"` (after ESM migration).
- Scripts: `test` → `node --test`, add `lint` → `eslint .`, `format` → `prettier --write .`.
- Consider renaming the package from confusing `js.js` to `jumbosocket` (note: npm rename is a republish; coordinate, keep `js.js` README alias). **Decision needed.**
- Remove `directories.lib` pointing at non-existent `./lib/js` mismatch, or correct it.

---

## 7. Execution Phases (suggested order, each independently shippable)

1. **Baseline & safety net** — branch off `master`; record current `npm audit`/test output.
2. **Tooling swap** — delete Grunt/Karma/JSHint chain; add ESLint+Prettier flat config; rewrite tests on `node:test`; get a green `npm test` + `npm run lint`. (Clears most CVEs immediately.)
3. **Bug fixes** — apply §3 items 1–8 with regression tests, still in CommonJS for a tight diff.
4. **ESM + Node 24** — convert to ESM, set `engines`/`.nvmrc`, update examples, add GitHub Actions CI (Node 22 + 24 matrix).
5. **Refactor pass** — §3 items 9–15 (URL API, async/await, dedupe IP helpers, response helpers, license/header cleanup).
6. **Docs** — update README (Node version, install, usage, ESM examples), regenerate/refresh examples.

Phases 1–3 deliver the security + correctness wins fast; 4–6 are the deeper modernization.

---

## 8. Open Decisions (need owner input)

- **Node floor:** `>=24` (longest support) vs `>=22` (broader compat)?
- **ESM vs stay CommonJS:** ESM is the modern default but is a breaking change for consumers using `require("js.js")`. Could ship dual-format or keep CJS.
- **Package rename** `js.js` → `jumbosocket`?
- **Example client assets:** modernize vs leave as legacy demo.
