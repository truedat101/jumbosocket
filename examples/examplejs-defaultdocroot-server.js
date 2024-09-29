/**
#
#Copyright (c) 2011-2024 Razortooth Communications, LLC. All rights reserved.
#
#Redistribution and use in source and binary forms, with or without modification,
#are permitted provided that the following conditions are met:
#
#    * Redistributions of source code must retain the above copyright notice,
#      this list of conditions and the following disclaimer.
#
#    * Redistributions in binary form must reproduce the above copyright notice,
#      this list of conditions and the following disclaimer in the documentation
#      and/or other materials provided with the distribution.
#
#    * Neither the name of Razortooth Communications, LLC, nor the names of its
#      contributors may be used to endorse or promote products derived from this
#      software without specific prior written permission.
#
#THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
#ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
#WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
#DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR
#ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
#(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
#LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
#ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
#(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
#SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
**/

//
// Run this example from a different directory, and let the server figure out that 
// by default it will look in the absolute path pointing to the examples dir
// 
// > node <some other path to this examples directory>/examplejs-defaultdocroot-server.js
//
// It will look in the default docroot (which is ../../examples) to find it's static assets
// Normally, you want to set DOCROOT appropriate to your application
//
var JS =  require("../lib/js/js.js").JS,
	util = require("util"),
	url = require('url');
var js = new JS();
// js.CONFIG.DOCROOT = './';
console.log(js.CONFIG);
js.create(js.address, js.CONFIG.HTTPWS_PORT);
js.listenHttpWS();
js.listenSocketIO(js.js_handler); // This is initially set to null, so it will fallback to use js.DEFAULT_JS_HANDLER

js.get("/helloworld", function(req, res) {
        var body = 'hello world';
        res.writeHead(200, {
          'Content-Length': body.length,
          'Content-Type': 'text/plain'
        });
        res.write(body);
        res.end();
});

js.getterer("/helloworldly/[\\w\\.\\-]+", function(req, res) {
        var route = url.parse(req.url).pathname.split('/')[2];
        var body = 'helloworldy on route ' + route;
        console.log('helloworldly');
        res.writeHead(200, {
          'Content-Length': body.length,
          'Content-Type': 'text/plain'
        });
        res.write(body);
        res.end();
});

