/**
#
#Copyright (c) 2011 Razortooth Communications, LLC. All rights reserved.
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

var js = exports;

/** 
  * Attributions
  */
/** 
  js.js inspired by fu.js and socket.io 
 */

/** 
 * Imports
 */
var io = require('socket.io'),
	createServer = require('http').createServer,
	sys = require('sys'),
	assert = require('assert'), 
	url = require('url');

/** 
  * CONFIG
  *
  */
js.CONFIG = {'HTTPWS_PORT':8000};
var INTERNAL_SERVER_ERROR = 'Internal Server Error!  Oh pshaw\n';
/**
  * js.js - jumbosocket 
  * 
  */
js.ROUTE_MAP = {};
js.RE_MAP = {};
js.address = 'localhost';

js.get = function(path, handler) {
	js.ROUTE_MAP[path] = handler;
};

js.getterer = function(path, handler) {
	var repath = RegExp(path);
	js.RE_MAP[path] = repath;
	// console.log(regexMap);
	fu.get(repath, handler);
}

js.get = function(path, handler) {
	js.ROUTE_MAP[path] = handler;
}
var server = createServer(function(req, res) {
		try {
			if (req.method === "GET" || req.method === "HEAD") {
				var handler;
				handler = js.ROUTE_MAP[url.parse(req.url).pathname];
				if (!handler) {
					for (var expr in js.RE_MAP) {
						sys.puts('expr: ' + expr);
						if (js.RE_MAP[expr] && js.RE_MAP[expr].test(url.parse(req.url).pathname)) {
							handler = js.ROUTE_MAP[js.RE_MAP[unid].toString()];
							break;
						}
					}
				}
			}

			res.simpleText = function (code, body) {
		      	res.writeHead(code, { "Content-Type": "text/plain"
									, "Content-Length": body.length
							});
				res.end(body);
			};

			res.simpleJSON = function (code, obj) {
				var body = JSON.stringify(obj);
				res.writeHead(code, { "Content-Type": "text/json"
									, "Content-Length": body.length
							});
				res.end(body);
			};

			handler(req, res);
		} catch(e) {
			console.log("Caught a server-side Node.js exception.  Ouch!  Here's what happened: " + e.name + ". Error message: " + e.message);
			internalServerError(req, res);
		}

});

js.listenHttpWS = function (port, host) {
	server.listen(port, host);
	js.address = server.address().address;
	sys.puts("Server at http://" + (host || "127.0.0.1") + ":" + port.toString() + "/");
};

js.close = function () { 
	server.close(); 
};

js.listenSocketIO = function(servicehandler) {
	var socket = io.listen(server);
	socket.on('connection', servicehandler);
};

/**
  * Utility Routines
  */

/**
  * Error Routines
  */
function internalServerError(req, res) { // XXX Add a nicely formatted version!
  // XXX For some reason, this always returns garbage: 22 Internal Server Error.  Oh psh
  // Need to debug this!
  res.writeHead(500, {  'Content-Type': 'text/plain',
						'Content-Length': INTERNAL_SERVER_ERROR.length
                     });
  res.write(INTERNAL_SERVER_ERROR);
  // sys.log(sys.inspect(getMap, true, null)); // XXX Dump the getMap to the logs
  res.end();
}

/**
  * JumboSocket Service Handler - Define your App Here
  */
js.get("/helloworld", function(req, res) {
	var body = 'hello world';
	res.writeHead(200, {
	  'Content-Length': body.length,
	  'Content-Type': 'text/plain'
	});
	res.write(body);
	res.end();
});

js.listenHttpWS(js.CONFIG['HTTPWS_PORT'], js.address);
/*
js.listenSocketIO(function(client) {
	client.on('message', function() {
	});

	client.on('disconnect', function() {
	});
});
*/