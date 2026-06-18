// SPDX-License-Identifier: BSD-3-Clause
//
// Run from anywhere:
//   > node <path-to>/examplejs-defaultdocroot-server.js
//
// Demonstrates the *default* DOCROOT: when you don't set js.CONFIG.DOCROOT,
// jumbosocket serves the bundled examples directory.

import { JS } from '../index.js';

const js = new JS();
// (DOCROOT left at its default — the package's examples directory.)
console.log(js.CONFIG);

js.create(js.address, js.CONFIG.HTTPWS_PORT);
js.get('/helloworld', (req, res) => res.simpleText(200, 'hello world'));
js.listenHttpWS();
