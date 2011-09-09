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

var js =  require("./js.js"),
	net = require("net"),
	sys = require("sys"),
	url = require('url'),
	util = require('util'),
	CCNDAdmin = require('ccn4bnode').CCNDAdmin,
	logger = require('nlogger').logger(module);


js.get("/ccn4bnode", js.staticHandler("ccn4bnode.html"));

js.get("/pingstatus", function(req, res) {
	var status = {'status': 'stopped'};
	var len;
	var data = new Buffer(1024); 
	var grep4ccnd = js.executil('ps aux | grep ccnd | grep -v grep', null ,function(error, stdout, stderr) {
			logger.debug('******** pingstatus ***********');
			// logger.debug('stdout: ' + data + (new Date).getTime());
			if (stderr) logger.debug('stderr: ' + stderr);
			if (error !== null) {
				logger.error('exec error: ' + error);
			}
			len = data.write(stdout.toString('ascii', 0), 'utf8', 0);
			logger.debug('wrote ' + len + ' bytes');
			logger.debug(data.toString('ascii', 0, len));
			
			if (len > 0) status.status = 'started';
			res.simpleJSON(200, status);
		});
});

/** 
  * XXX Need to decide if we want to have a main router method for incoming calls
  */
js.getterer("/ccnd/[\\w\\.\\-]+", function(req, res) {
	var status = {'status': 'stopped'};
	var route = url.parse(req.url).pathname.split('/')[2];
	var len;
	
	var ccnd_handle = new CCNDAdmin(); // XXX We should just do this once and cache it
	
	switch (route) {
    	case 'stop':
			stop();
			break;
		case 'start':
			start();
			break;
		case 'restart':
			restart();
			break;
		case 'stats':
			stats();
			break;
		case 'rss':
			rss();
			break;
		default:
			status.status = 'unknown';
			res.simpleJSON(200, status);
			break;
	}
	
	function rss() {
		status.status = 'unknown'; // XXX I need a lighter weight way to just ping ccnd, leave status unknown for now
		status['results'] = process.memoryUsage(); // util.inspect(process.memoryUsage())
		res.simpleJSON(200, status);
	};
	
	function stop() {
		ccnd_handle.stop(function(error, stdout, stderr) {
				var data = new Buffer(1024); // XXX We can get rid of this
				logger.debug('******** ccndstop ***********');
				// logger.debug('stdout: ' + data + (new Date).getTime());
				if (stderr) logger.debug('stderr: ' + stderr);
				if (error !== null) {
					logger.error('exec error: ' + error);
				}
				len = data.write(stdout.toString('ascii', 0), 'utf8', 0);
				logger.debug('wrote ' + len + ' bytes');
				logger.debug(data.toString('ascii', 0, len));

				if (len > 0) {
					status['results'] = data.toString('ascii', 0, len);
				} else {
					status['results'] = '';
				}
				res.simpleJSON(200, status);
			});
	};
	
	function start() {
		ccnd_handle.start(); // XXX This sucks, but oh well.  Need to set up an event emitter to notify when started
		logger.debug('******** ccnd start ***********');
		status.status = 'started';  // XXX For now assume started unless pingstatus tells us something different
		status['results'] = '';
		res.simpleJSON(200, status);
	};
	
	function restart() {
		ccnd_handle.restart();
		ogger.debug('******** ccnd restart***********');
		status.status = 'restarting';
		res.simpleJSON(200, status);
	};
	
	function stats() {
		ccnd_handle.stats(function(error, stdout, stderr) {
				var data = new Buffer(1024); // XXX We can get rid of this
				logger.debug('******** ccndstatus ***********');
				// logger.debug('stdout: ' + data + (new Date).getTime());
				if (stderr) logger.debug('stderr: ' + stderr);
				if (error !== null) {
					logger.error('exec error: ' + error);
				}
				len = data.write(stdout.toString('ascii', 0), 'utf8', 0);
				logger.debug('wrote ' + len + ' bytes');
				logger.debug(data.toString('ascii', 0, len));

				if (len > 0) {
					status.status = 'started';
					status['results'] = data.toString('ascii', 0, len).split('\n');
				} else {
					status.status = 'stopped';
					status['results'] = '';
				}
				res.simpleJSON(200, status);
			});
	};
});

js.get("/helloworld", function(req, res) {
        var body = 'hello world';
        res.writeHead(200, {
          'Content-Length': body.length,
          'Content-Type': 'text/plain'
        });
        res.write(body);
        res.end();
});

js.getterer("/ccn/[\\w\\.\\-]+", function(req, res) {
        var route = url.parse(req.url).pathname.split('/')[2];
        var body = 'ccn on route ' + route;
        sys.puts('ccn');
        res.writeHead(200, {
          'Content-Length': body.length,
          'Content-Type': 'text/plain'
        });
        res.write(body);
        res.end();
});

js.getterer("/cs/[\\w\\.\\-]+", function(req, res) {
        var route = url.parse(req.url).pathname.split('/')[2];
        var body = 'ccn on route ' + route;
        sys.puts('ccn');
        res.writeHead(200, {
          'Content-Length': body.length,
          'Content-Type': 'text/plain'
        });
        res.write(body);
        res.end();
});

js.getterer("/fib/[\\w\\.\\-]+", function(req, res) {
        var route = url.parse(req.url).pathname.split('/')[2];
        var body = 'ccn on route ' + route;
        sys.puts('ccn');
        res.writeHead(200, {
          'Content-Length': body.length,
          'Content-Type': 'text/plain'
        });
        res.write(body);
        res.end();
});

js.getterer("/pit/[\\w\\.\\-]+", function(req, res) {
        var route = url.parse(req.url).pathname.split('/')[2];
        var body = 'ccn on route ' + route;
        sys.puts('ccn');
        res.writeHead(200, {
          'Content-Length': body.length,
          'Content-Type': 'text/plain'
        });
        res.write(body);
        res.end();
});
/**
 * This is a basic handler.  XXX Clean it up.  It's messy and not clear what is the purpose.
 * For now, just use it as is.  It pongs back messages.
 *
 */
function ccn4bnodeHandler(client) {
        // 
        // PLUG IN YOUR OWN SOCKET.IO HANDLERS HERE
        // This can be removed when you decide you want it to do something useful
        //
        console.log("*********** ccn4bnode listenSocketIO handler ******************");
        client.on('message', function(data) {
                if (data) {
                        sys.puts('socket client.on message data = ' + JSON.stringify(data) + '  at ' + (new Date().getTime()));
                        js.io.sockets.send("pong - " + JSON.stringify(data));
                } else { sys.err("empty message"); } // Ignore empty data messages
        });
        // XXX This dies with socket.io v0.7 .  Handling of broadcast is different.
        /* setInterval(function() { // This could be a tweet stream, game status updates, robot messages
                sys.puts('sending something on the socket');
                if (js.io) { // XXX Shouldn't this exist?
                        js.io.sockets.send("Ya'll ready for this");
                }
        }, 10000); */
}

js.js_handler = ccn4bnodeHandler;
js.listenHttpWS(js.CONFIG['HTTPWS_PORT'], js.address);
js.listenSocketIO(js.js_handler); // This is initially set to null, so it will fallback to use js.DEFAULT_JS_HANDLER
