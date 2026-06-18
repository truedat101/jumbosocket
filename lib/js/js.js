// SPDX-License-Identifier: BSD-3-Clause
// Copyright (c) 2011-2026 Razortooth Communications, LLC. All rights reserved.
// See the LICENSE file at the repository root for the full license text.

/**
 * jumbosocket — a small, dependency-free hypermedia server for big ideas.
 *
 * Provides HTTP routing, static file serving, and first-class Datastar
 * Server-Sent Events (SSE) helpers so the backend can drive the frontend by
 * streaming `datastar-patch-elements` / `datastar-patch-signals` events.
 *
 * Inspired by fu.js from the original node_chat demo.
 *
 * @see https://data-star.dev/reference/sse_events
 */

import { createServer } from 'node:http';
import { readFile, readFileSync } from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(
  readFileSync(path.join(__dirname, '../../package.json'), 'utf8'),
);

// Debug logging is on unless explicitly running in production.
const DEBUG = process.env.NODE_ENV !== 'production';

const INTERNAL_SERVER_ERROR = 'Internal Server Error! Oh pshaw\n';
const NOT_FOUND_ERROR = '404 Error :( I am sad.\n';
const NOT_IMPLEMENTED_ERROR = '501: Not implemented. Why not?\n';

// req.url is path-relative; the WHATWG URL parser needs a base to resolve it.
const URL_BASE = 'http://localhost';

/** Pull the (decoded) pathname out of an incoming request. */
function pathnameOf(req) {
  return new URL(req.url, URL_BASE).pathname;
}

/**
 * Common MIME types by file extension (originally borrowed from Rack).
 * Kept inline to preserve jumbosocket's zero-dependency runtime.
 */
const MIME_TYPES = {
  '.3gp': 'video/3gpp',
  '.a': 'application/octet-stream',
  '.ai': 'application/postscript',
  '.aif': 'audio/x-aiff',
  '.aiff': 'audio/x-aiff',
  '.asc': 'application/pgp-signature',
  '.asf': 'video/x-ms-asf',
  '.asm': 'text/x-asm',
  '.asx': 'video/x-ms-asf',
  '.atom': 'application/atom+xml',
  '.au': 'audio/basic',
  '.avi': 'video/x-msvideo',
  '.bat': 'application/x-msdownload',
  '.bin': 'application/octet-stream',
  '.bmp': 'image/bmp',
  '.bz2': 'application/x-bzip2',
  '.c': 'text/x-c',
  '.cab': 'application/vnd.ms-cab-compressed',
  '.cc': 'text/x-c',
  '.chm': 'application/vnd.ms-htmlhelp',
  '.class': 'application/octet-stream',
  '.com': 'application/x-msdownload',
  '.conf': 'text/plain',
  '.cpp': 'text/x-c',
  '.crt': 'application/x-x509-ca-cert',
  '.css': 'text/css',
  '.csv': 'text/csv',
  '.cxx': 'text/x-c',
  '.deb': 'application/x-debian-package',
  '.der': 'application/x-x509-ca-cert',
  '.diff': 'text/x-diff',
  '.djv': 'image/vnd.djvu',
  '.djvu': 'image/vnd.djvu',
  '.dll': 'application/x-msdownload',
  '.dmg': 'application/octet-stream',
  '.doc': 'application/msword',
  '.dot': 'application/msword',
  '.dtd': 'application/xml-dtd',
  '.dvi': 'application/x-dvi',
  '.ear': 'application/java-archive',
  '.eml': 'message/rfc822',
  '.eps': 'application/postscript',
  '.exe': 'application/x-msdownload',
  '.f': 'text/x-fortran',
  '.f77': 'text/x-fortran',
  '.f90': 'text/x-fortran',
  '.flv': 'video/x-flv',
  '.apk': 'application/vnd.android.package-archive',
  '.for': 'text/x-fortran',
  '.gem': 'application/octet-stream',
  '.gemspec': 'text/x-script.ruby',
  '.gif': 'image/gif',
  '.gz': 'application/x-gzip',
  '.h': 'text/x-c',
  '.hh': 'text/x-c',
  '.htm': 'text/html',
  '.html': 'text/html',
  '.ico': 'image/vnd.microsoft.icon',
  '.ics': 'text/calendar',
  '.ifb': 'text/calendar',
  '.iso': 'application/octet-stream',
  '.jar': 'application/java-archive',
  '.java': 'text/x-java-source',
  '.jnlp': 'application/x-java-jnlp-file',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.log': 'text/plain',
  '.m3u': 'audio/x-mpegurl',
  '.m4v': 'video/mp4',
  '.man': 'text/troff',
  '.mathml': 'application/mathml+xml',
  '.mbox': 'application/mbox',
  '.mdoc': 'text/troff',
  '.me': 'text/troff',
  '.mid': 'audio/midi',
  '.midi': 'audio/midi',
  '.mime': 'message/rfc822',
  '.mjs': 'text/javascript',
  '.mml': 'application/mathml+xml',
  '.mng': 'video/x-mng',
  '.mov': 'video/quicktime',
  '.mp3': 'audio/mpeg',
  '.mp4': 'video/mp4',
  '.mp4v': 'video/mp4',
  '.mpeg': 'video/mpeg',
  '.mpg': 'video/mpeg',
  '.ms': 'text/troff',
  '.msi': 'application/x-msdownload',
  '.odp': 'application/vnd.oasis.opendocument.presentation',
  '.ods': 'application/vnd.oasis.opendocument.spreadsheet',
  '.odt': 'application/vnd.oasis.opendocument.text',
  '.ogg': 'application/ogg',
  '.p': 'text/x-pascal',
  '.pas': 'text/x-pascal',
  '.pbm': 'image/x-portable-bitmap',
  '.pdf': 'application/pdf',
  '.pem': 'application/x-x509-ca-cert',
  '.pgm': 'image/x-portable-graymap',
  '.pgp': 'application/pgp-encrypted',
  '.pkg': 'application/octet-stream',
  '.pl': 'text/x-script.perl',
  '.pm': 'text/x-script.perl-module',
  '.png': 'image/png',
  '.pnm': 'image/x-portable-anymap',
  '.ppm': 'image/x-portable-pixmap',
  '.pps': 'application/vnd.ms-powerpoint',
  '.ppt': 'application/vnd.ms-powerpoint',
  '.ps': 'application/postscript',
  '.psd': 'image/vnd.adobe.photoshop',
  '.py': 'text/x-script.python',
  '.qt': 'video/quicktime',
  '.ra': 'audio/x-pn-realaudio',
  '.rake': 'text/x-script.ruby',
  '.ram': 'audio/x-pn-realaudio',
  '.rar': 'application/x-rar-compressed',
  '.rb': 'text/x-script.ruby',
  '.rdf': 'application/rdf+xml',
  '.roff': 'text/troff',
  '.rpm': 'application/x-redhat-package-manager',
  '.rss': 'application/rss+xml',
  '.rtf': 'application/rtf',
  '.ru': 'text/x-script.ruby',
  '.s': 'text/x-asm',
  '.sgm': 'text/sgml',
  '.sgml': 'text/sgml',
  '.sh': 'application/x-sh',
  '.sig': 'application/pgp-signature',
  '.snd': 'audio/basic',
  '.so': 'application/octet-stream',
  '.svg': 'image/svg+xml',
  '.svgz': 'image/svg+xml',
  '.swf': 'application/x-shockwave-flash',
  '.t': 'text/troff',
  '.tar': 'application/x-tar',
  '.tbz': 'application/x-bzip-compressed-tar',
  '.tcl': 'application/x-tcl',
  '.tex': 'application/x-tex',
  '.texi': 'application/x-texinfo',
  '.texinfo': 'application/x-texinfo',
  '.text': 'text/plain',
  '.tif': 'image/tiff',
  '.tiff': 'image/tiff',
  '.torrent': 'application/x-bittorrent',
  '.tr': 'text/troff',
  '.txt': 'text/plain',
  '.vcf': 'text/x-vcard',
  '.vcs': 'text/x-vcalendar',
  '.vrml': 'model/vrml',
  '.war': 'application/java-archive',
  '.wav': 'audio/x-wav',
  '.wma': 'audio/x-ms-wma',
  '.wmv': 'video/x-ms-wmv',
  '.wmx': 'video/x-ms-wmx',
  '.wrl': 'model/vrml',
  '.wsdl': 'application/wsdl+xml',
  '.xbm': 'image/x-xbitmap',
  '.xhtml': 'application/xhtml+xml',
  '.xls': 'application/vnd.ms-excel',
  '.xml': 'application/xml',
  '.xpm': 'image/x-xpixmap',
  '.xsl': 'application/xml',
  '.xslt': 'application/xslt+xml',
  '.yaml': 'text/yaml',
  '.yml': 'text/yaml',
  '.zip': 'application/zip',
};

/** Look up the MIME type for a file extension, falling back to octet-stream. */
function lookupMime(ext, fallback) {
  return (
    MIME_TYPES[String(ext).toLowerCase()] ||
    fallback ||
    'application/octet-stream'
  );
}

/* -------------------------------------------------------------------------- *
 * Datastar SSE framing helpers
 * https://data-star.dev/reference/sse_events
 * -------------------------------------------------------------------------- */

/** Build a single SSE frame for an event with the given `data:` lines. */
function formatEvent(event, dataLines) {
  return (
    `event: ${event}\n` +
    dataLines.map((line) => `data: ${line}\n`).join('') +
    '\n'
  );
}

/**
 * Build a `datastar-patch-elements` frame.
 * @param {string} elements HTML markup (may span multiple lines).
 * @param {{selector?: string, mode?: string, useViewTransition?: boolean}} [opts]
 */
function patchElementsFrame(elements, opts = {}) {
  const lines = [];
  if (opts.selector) lines.push(`selector ${opts.selector}`);
  if (opts.mode) lines.push(`mode ${opts.mode}`);
  if (opts.useViewTransition) lines.push('useViewTransition true');
  // The `elements` value may contain newlines; emit one data line per line.
  for (const line of String(elements).split('\n')) {
    lines.push(`elements ${line}`);
  }
  return formatEvent('datastar-patch-elements', lines);
}

/**
 * Build a `datastar-patch-signals` frame.
 * @param {object} signals Signal values to merge into the frontend store.
 * @param {{onlyIfMissing?: boolean}} [opts]
 */
function patchSignalsFrame(signals, opts = {}) {
  const lines = [`signals ${JSON.stringify(signals)}`];
  if (opts.onlyIfMissing) lines.push('onlyIfMissing true');
  return formatEvent('datastar-patch-signals', lines);
}

/* -------------------------------------------------------------------------- *
 * Network helpers
 * -------------------------------------------------------------------------- */

/**
 * Resolve the first non-internal IPv4 address using os.networkInterfaces().
 * Works cross-platform (issue #7) — no shelling out to `ifconfig`.
 * @returns {string|null}
 */
export function getNetworkIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const addr of interfaces[name] ?? []) {
      const family = addr.family === 4 || addr.family === 'IPv4';
      if (family && !addr.internal && !addr.address.startsWith('169.')) {
        return addr.address;
      }
    }
  }
  return null;
}

/* -------------------------------------------------------------------------- *
 * JS — the jumbosocket server
 * -------------------------------------------------------------------------- */

export class JS {
  constructor() {
    this.CONFIG = {
      HTTPWS_PORT: 8000,
      LISTEN_ON_ADDRESS: '0.0.0.0',
      VERSION_TAG: pkg.version,
      VERSION_DESCRIPTION:
        'NPM package for Jumbosocket, affectionately known as JS.js',
      // Absolute path to the bundled examples directory by default.
      DOCROOT: path.resolve(__dirname, '../../examples'),
    };

    this.ROUTE_MAP = {}; // exact-match routes: pathname -> handler
    this.RE_MAP = {}; // regex routes: pattern string -> RegExp
    // Change to 'localhost' if you don't want to bind a network-facing IP.
    this.address = '0.0.0.0';
    this.MSGS = []; // diagnostic log ring
    this.clients = new Set(); // open SSE responses, for broadcast
    this.server = null;
  }

  /* ----- routing ----- */

  get(routePath, handler) {
    this.ROUTE_MAP[routePath] = handler;
    return this;
  }

  post(routePath, handler) {
    this.ROUTE_MAP[routePath] = handler;
    return this;
  }

  /** Register a regex route. `pattern` is a RegExp source string. */
  getterer(pattern, handler) {
    const re = new RegExp(pattern);
    this.RE_MAP[pattern] = re;
    this.get(re.toString(), handler);
    return this;
  }

  /* ----- static files ----- */

  /**
   * Return a handler that serves `relPath` (relative to DOCROOT). Resolves the
   * file safely so requests cannot escape DOCROOT via `..` traversal.
   */
  staticHandler(relPath) {
    const docroot = path.resolve(this.CONFIG.DOCROOT);
    let decoded = relPath;
    try {
      decoded = decodeURIComponent(relPath);
    } catch {
      // Malformed percent-encoding — treat as not found below.
      decoded = relPath;
    }
    const target = path.resolve(docroot, '.' + path.sep + decoded);
    const contentType = lookupMime(path.extname(target));

    return (req, res) => {
      // Security: never serve anything outside the document root.
      if (target !== docroot && !target.startsWith(docroot + path.sep)) {
        return this.notFound(req, res);
      }
      readFile(target, (err, data) => {
        if (err) {
          if (DEBUG) console.log(`Error loading file ${target}: ${err}`);
          return this.notFound(req, res);
        }
        const headers = {
          'Content-Type': contentType,
          'Content-Length': data.length,
        };
        if (!DEBUG) headers['Cache-Control'] = 'public';
        res.writeHead(200, headers);
        res.end(req.method === 'HEAD' ? '' : data);
      });
    };
  }

  /* ----- Server-Sent Events / Datastar ----- */

  /**
   * Open a long-lived Datastar SSE stream on `res`, register it for broadcast,
   * and return a handle for pushing patches to this client.
   * @returns {{patchElements: Function, patchSignals: Function, close: Function, res: import('node:http').ServerResponse}}
   */
  sse(req, res) {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    });
    res.write('retry: 1000\n\n');

    this.clients.add(res);
    const cleanup = () => this.clients.delete(res);
    req.on('close', cleanup);
    res.on('close', cleanup);

    return {
      patchElements: (elements, opts) =>
        res.write(patchElementsFrame(elements, opts)),
      patchSignals: (signals, opts) =>
        res.write(patchSignalsFrame(signals, opts)),
      close: () => {
        cleanup();
        res.end();
      },
      res,
    };
  }

  /** Broadcast a `datastar-patch-elements` event to every open SSE stream. */
  broadcastElements(elements, opts) {
    const frame = patchElementsFrame(elements, opts);
    for (const res of this.clients) res.write(frame);
  }

  /** Broadcast a `datastar-patch-signals` event to every open SSE stream. */
  broadcastSignals(signals, opts) {
    const frame = patchSignalsFrame(signals, opts);
    for (const res of this.clients) res.write(frame);
  }

  /* ----- lifecycle ----- */

  setIP(address) {
    this.address = address;
    return this;
  }

  /** Create the HTTP server and wire up routing. */
  create(host, port) {
    if (host) this.CONFIG.LISTEN_ON_ADDRESS = host;
    if (port) this.CONFIG.HTTPWS_PORT = port;

    this.server = createServer((req, res) => {
      // Tiny response helpers, available to every route handler.
      res.simpleText = (code, body) => {
        res.writeHead(code, {
          'Content-Type': 'text/plain',
          'Content-Length': Buffer.byteLength(body),
        });
        res.end(body);
      };
      res.simpleJSON = (code, obj) => {
        const body = JSON.stringify(obj);
        res.writeHead(code, {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(body),
        });
        res.end(body);
      };

      try {
        const pathname = pathnameOf(req);
        let handler;

        if (
          req.method === 'GET' ||
          req.method === 'POST' ||
          req.method === 'HEAD'
        ) {
          handler = this.ROUTE_MAP[pathname];
          if (!handler) {
            for (const expr of Object.keys(this.RE_MAP)) {
              const re = this.RE_MAP[expr];
              if (re.test(pathname)) {
                handler = this.ROUTE_MAP[re.toString()];
                break;
              }
            }
          }
          if (!handler) handler = (q, s) => this.notFound(q, s);
        } else {
          handler = (q, s) => this.notImplemented(q, s);
        }

        handler(req, res);
      } catch (e) {
        const mess = `Caught a server-side exception: ${e.name}. Message: ${e.message}`;
        console.error(mess);
        this.MSGS.push(`${new Date().toISOString()},${mess}`);
        this.internalServerError(req, res);
      }
    });

    this.init();
    return this;
  }

  /** Start listening. Resolves the real IP once bound to 0.0.0.0. */
  listenHttpWS(host, port) {
    if (!this.server) {
      throw new Error('Call create() before listenHttpWS().');
    }
    port = port || this.CONFIG.HTTPWS_PORT;
    host = host || this.CONFIG.LISTEN_ON_ADDRESS;

    this.server.listen(port, host, () => {
      this.address = this.server.address().address;
      if (this.address === '0.0.0.0') {
        const ip = getNetworkIP();
        if (ip) {
          this.address = ip;
          this.setIP(ip);
          if (DEBUG) console.log('Resolved server IP address:', ip);
        }
      }
      if (DEBUG) {
        const bound = this.server.address().port;
        console.log(`Server at http://${host || '127.0.0.1'}:${bound}/`);
      }
    });
    return this;
  }

  close(callback) {
    if (this.server) this.server.close(callback);
    for (const res of this.clients) res.end();
    this.clients.clear();
    return this;
  }

  /** Register jumbosocket's default routes. */
  init() {
    this.get('/', this.staticHandler('index.html'));
    this.get('/index.html', this.staticHandler('index.html'));
    this.getterer('/css/[\\w.\\-]+', (req, res) =>
      this.staticHandler('.' + pathnameOf(req))(req, res),
    );
    this.getterer('/js/[\\w.\\-]+', (req, res) =>
      this.staticHandler('.' + pathnameOf(req))(req, res),
    );
    this.getterer('/images/[\\w.\\-]+', (req, res) =>
      this.staticHandler('.' + pathnameOf(req))(req, res),
    );

    this.get('/about', (req, res) => {
      res.simpleText(
        200,
        `${this.CONFIG.VERSION_TAG}: ${this.CONFIG.VERSION_DESCRIPTION}`,
      );
    });
    return this;
  }

  /* ----- error handlers ----- */

  internalServerError(req, res, msg) {
    const body = msg
      ? `${INTERNAL_SERVER_ERROR}  Reason: ${msg}`
      : INTERNAL_SERVER_ERROR;
    console.error(`${INTERNAL_SERVER_ERROR.trim()} on: ${req.url}`);
    res.writeHead(500, {
      'Content-Type': 'text/plain',
      'Content-Length': Buffer.byteLength(body),
    });
    res.end(body);
  }

  notImplemented(req, res) {
    if (DEBUG) console.error(NOT_IMPLEMENTED_ERROR.trim());
    res.writeHead(501, {
      'Content-Type': 'text/plain',
      'Content-Length': Buffer.byteLength(NOT_IMPLEMENTED_ERROR),
    });
    res.end(NOT_IMPLEMENTED_ERROR);
  }

  notFound(req, res) {
    if (DEBUG) console.error(NOT_FOUND_ERROR.trim());
    res.writeHead(404, {
      'Content-Type': 'text/plain',
      'Content-Length': Buffer.byteLength(NOT_FOUND_ERROR),
    });
    res.end(NOT_FOUND_ERROR);
  }
}

// Exposed for tests and advanced use.
export { patchElementsFrame, patchSignalsFrame, lookupMime };

export default JS;
