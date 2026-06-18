// SPDX-License-Identifier: BSD-3-Clause
//
// Run from anywhere:
//   > node <path-to>/examplejs-dirnamedocroot-server.js
//
// Demonstrates setting DOCROOT explicitly to the directory containing this
// file, so static assets resolve relative to the app regardless of cwd.

import { JS } from '../index.js';

const js = new JS();
js.CONFIG.DOCROOT = import.meta.dirname; // absolute path to this directory
console.log(js.CONFIG);

js.create(js.address, js.CONFIG.HTTPWS_PORT);
js.get('/helloworld', (req, res) => res.simpleText(200, 'hello world'));
js.listenHttpWS();
