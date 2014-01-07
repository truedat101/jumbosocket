/**
#
#Copyright (c) 2011-2014 Razortooth Communications, LLC. All rights reserved.
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

/** 
 * Imports
 */
var createServer = require('http').createServer,
	util = require('util'),
	assert = require('assert'),
	fs = require('fs'),
	events = require('events'),
	path = require('path'),
	winston = require('winston'),
	pkgjson = require('../../package.json'),
	url = require('url'); // Let's also swtich to using WINSTON logging

/** 
  * Attributions
  */
/** 
  js.js a small server for big ideas, offering a small template starter project
  Inspired by:
  - fu.js: from the node_chat demo, source of major inspiration
  - socket.io: to handle socket oriented communication
  - All the more complicated software that I didn't feel like learning
  - node.js: for the runtime
 */
var JS = exports.JS = function() {
	this.CONFIG = {
		'HTTPWS_PORT':8000,
		'LISTEN_ON_ADDRESS': '0.0.0.0',
		'VERSION_TAG': pkgjson.version,
		'VERSION_DESCRIPTION':'NPM package for Jumbosocket, affectionately known as JS.js',
		'DOCROOT': process.cwd() + '/' + 'static'
	};
	// process.cwd()
	this.ROUTE_MAP = {}; // Populate this with the App Routes you set up
	this.RE_MAP = {}; // Populate this with the App Routes you set up
	this.address = '0.0.0.0'; // If you don't want this exposed on a network facing IP address, change to 'localhost'
	this.channels = {}; // XXX Should move to using socket.io namespaces
	this.DEFAULT_JS_HANDLER = defaultJSHandler;
	this.MSGS = [];
	this.server; 
	this.js_handler; // Set this to some handler you want to use for Socket.IO, otherwise, default to defaultJSHandler
	// Add more transports here for Winston logging
	// new (winston.transports.File)({ filename: 'js.log' })
	this.logger = new (winston.Logger) ({
		transports: [
			new (winston.transports.Console)()
		]
	});
};
// module.exports = JS;
// XXX Not quite sure why I'd do this
// var JS = exports; 


DEBUG = true;
var INTERNAL_SERVER_ERROR = 'Internal Server Error!  Oh pshaw\n';
var NOT_FOUND_ERROR = '404 Error :(  I am sad.  \n';
var NOT_IMPLEMENTED_ERROR = '501: Not implemented.  Why not?\n';



if (DEBUG) {
	console.log("TURN OFF DEBUG for Production");
}

JS.prototype.get = function(path, handler) {
	this.ROUTE_MAP[path] = handler;
};

JS.prototype.post = function(path, handler) {
	this.ROUTE_MAP[path] = handler;
};
JS.prototype.getterer = function(path, handler) {
	var repath = RegExp(path);
	this.RE_MAP[path] = repath;
	// console.log(regexMap);
	this.get(repath, handler);
}

// Static Variables
JS.prototype.mime = {
  // returns MIME type for extension, or fallback, or octet-steam
  lookupExtension : function(ext, fallback) {
    return this.TYPES[ext.toLowerCase()] || fallback || 'application/octet-stream';
  },

  // List of most common mime-types, stolen from Rack.
  // XXX: Can we refactor this out, replace with an NPM module or something more compact?
  TYPES : { ".3gp"   : "video/3gpp"
          , ".a"     : "application/octet-stream"
          , ".ai"    : "application/postscript"
          , ".aif"   : "audio/x-aiff"
          , ".aiff"  : "audio/x-aiff"
          , ".asc"   : "application/pgp-signature"
          , ".asf"   : "video/x-ms-asf"
          , ".asm"   : "text/x-asm"
          , ".asx"   : "video/x-ms-asf"
          , ".atom"  : "application/atom+xml"
          , ".au"    : "audio/basic"
          , ".avi"   : "video/x-msvideo"
          , ".bat"   : "application/x-msdownload"
          , ".bin"   : "application/octet-stream"
          , ".bmp"   : "image/bmp"
          , ".bz2"   : "application/x-bzip2"
          , ".c"     : "text/x-c"
          , ".cab"   : "application/vnd.ms-cab-compressed"
          , ".cc"    : "text/x-c"
          , ".chm"   : "application/vnd.ms-htmlhelp"
          , ".class"   : "application/octet-stream"
          , ".com"   : "application/x-msdownload"
          , ".conf"  : "text/plain"
          , ".cpp"   : "text/x-c"
          , ".crt"   : "application/x-x509-ca-cert"
          , ".css"   : "text/css"
          , ".csv"   : "text/csv"
          , ".cxx"   : "text/x-c"
          , ".deb"   : "application/x-debian-package"
          , ".der"   : "application/x-x509-ca-cert"
          , ".diff"  : "text/x-diff"
          , ".djv"   : "image/vnd.djvu"
          , ".djvu"  : "image/vnd.djvu"
          , ".dll"   : "application/x-msdownload"
          , ".dmg"   : "application/octet-stream"
          , ".doc"   : "application/msword"
          , ".dot"   : "application/msword"
          , ".dtd"   : "application/xml-dtd"
          , ".dvi"   : "application/x-dvi"
          , ".ear"   : "application/java-archive"
          , ".eml"   : "message/rfc822"
          , ".eps"   : "application/postscript"
          , ".exe"   : "application/x-msdownload"
          , ".f"     : "text/x-fortran"
          , ".f77"   : "text/x-fortran"
          , ".f90"   : "text/x-fortran"
          , ".flv"   : "video/x-flv"
		  , ".apk"	 : "application/vnd.android.package-archive"
          , ".for"   : "text/x-fortran"
          , ".gem"   : "application/octet-stream"
          , ".gemspec" : "text/x-script.ruby"
          , ".gif"   : "image/gif"
          , ".gz"    : "application/x-gzip"
          , ".h"     : "text/x-c"
          , ".hh"    : "text/x-c"
          , ".htm"   : "text/html"
          , ".html"  : "text/html"
          , ".ico"   : "image/vnd.microsoft.icon"
          , ".ics"   : "text/calendar"
          , ".ifb"   : "text/calendar"
          , ".iso"   : "application/octet-stream"
          , ".jar"   : "application/java-archive"
          , ".java"  : "text/x-java-source"
          , ".jnlp"  : "application/x-java-jnlp-file"
          , ".jpeg"  : "image/jpeg"
          , ".jpg"   : "image/jpeg"
          , ".js"    : "application/javascript"
          , ".json"  : "application/json"
          , ".log"   : "text/plain"
          , ".m3u"   : "audio/x-mpegurl"
          , ".m4v"   : "video/mp4"
          , ".man"   : "text/troff"
          , ".mathml"  : "application/mathml+xml"
          , ".mbox"  : "application/mbox"
          , ".mdoc"  : "text/troff"
          , ".me"    : "text/troff"
          , ".mid"   : "audio/midi"
          , ".midi"  : "audio/midi"
          , ".mime"  : "message/rfc822"
          , ".mml"   : "application/mathml+xml"
          , ".mng"   : "video/x-mng"
          , ".mov"   : "video/quicktime"
          , ".mp3"   : "audio/mpeg"
          , ".mp4"   : "video/mp4"
          , ".mp4v"  : "video/mp4"
          , ".mpeg"  : "video/mpeg"
          , ".mpg"   : "video/mpeg"
          , ".ms"    : "text/troff"
          , ".msi"   : "application/x-msdownload"
          , ".odp"   : "application/vnd.oasis.opendocument.presentation"
          , ".ods"   : "application/vnd.oasis.opendocument.spreadsheet"
          , ".odt"   : "application/vnd.oasis.opendocument.text"
          , ".ogg"   : "application/ogg"
          , ".p"     : "text/x-pascal"
          , ".pas"   : "text/x-pascal"
          , ".pbm"   : "image/x-portable-bitmap"
          , ".pdf"   : "application/pdf"
          , ".pem"   : "application/x-x509-ca-cert"
          , ".pgm"   : "image/x-portable-graymap"
          , ".pgp"   : "application/pgp-encrypted"
          , ".pkg"   : "application/octet-stream"
          , ".pl"    : "text/x-script.perl"
          , ".pm"    : "text/x-script.perl-module"
          , ".png"   : "image/png"
          , ".pnm"   : "image/x-portable-anymap"
          , ".ppm"   : "image/x-portable-pixmap"
          , ".pps"   : "application/vnd.ms-powerpoint"
          , ".ppt"   : "application/vnd.ms-powerpoint"
          , ".ps"    : "application/postscript"
          , ".psd"   : "image/vnd.adobe.photoshop"
          , ".py"    : "text/x-script.python"
          , ".qt"    : "video/quicktime"
          , ".ra"    : "audio/x-pn-realaudio"
          , ".rake"  : "text/x-script.ruby"
          , ".ram"   : "audio/x-pn-realaudio"
          , ".rar"   : "application/x-rar-compressed"
          , ".rb"    : "text/x-script.ruby"
          , ".rdf"   : "application/rdf+xml"
          , ".roff"  : "text/troff"
          , ".rpm"   : "application/x-redhat-package-manager"
          , ".rss"   : "application/rss+xml"
          , ".rtf"   : "application/rtf"
          , ".ru"    : "text/x-script.ruby"
          , ".s"     : "text/x-asm"
          , ".sgm"   : "text/sgml"
          , ".sgml"  : "text/sgml"
          , ".sh"    : "application/x-sh"
          , ".sig"   : "application/pgp-signature"
          , ".snd"   : "audio/basic"
          , ".so"    : "application/octet-stream"
          , ".svg"   : "image/svg+xml"
          , ".svgz"  : "image/svg+xml"
          , ".swf"   : "application/x-shockwave-flash"
          , ".t"     : "text/troff"
          , ".tar"   : "application/x-tar"
          , ".tbz"   : "application/x-bzip-compressed-tar"
          , ".tcl"   : "application/x-tcl"
          , ".tex"   : "application/x-tex"
          , ".texi"  : "application/x-texinfo"
          , ".texinfo" : "application/x-texinfo"
          , ".text"  : "text/plain"
          , ".tif"   : "image/tiff"
          , ".tiff"  : "image/tiff"
          , ".torrent" : "application/x-bittorrent"
          , ".tr"    : "text/troff"
          , ".txt"   : "text/plain"
          , ".vcf"   : "text/x-vcard"
          , ".vcs"   : "text/x-vcalendar"
          , ".vrml"  : "model/vrml"
          , ".war"   : "application/java-archive"
          , ".wav"   : "audio/x-wav"
          , ".wma"   : "audio/x-ms-wma"
          , ".wmv"   : "video/x-ms-wmv"
          , ".wmx"   : "video/x-ms-wmx"
          , ".wrl"   : "model/vrml"
          , ".wsdl"  : "application/wsdl+xml"
          , ".xbm"   : "image/x-xbitmap"
          , ".xhtml"   : "application/xhtml+xml"
          , ".xls"   : "application/vnd.ms-excel"
          , ".xml"   : "application/xml"
          , ".xpm"   : "image/x-xpixmap"
          , ".xsl"   : "application/xml"
          , ".xslt"  : "application/xslt+xml"
          , ".yaml"  : "text/yaml"
          , ".yml"   : "text/yaml"
          , ".zip"   : "application/zip"
          }
};
JS.prototype.staticHandler = function (filename) {
  var body, headers;
  var self = this;

  // We should be computing this path once ... might want to just set this in a function
  // that gets set during some init phase, or configuration?
  filename = path.join(path.dirname(require.main.filename) + '/' + self.CONFIG['DOCROOT'], filename);
  var content_type = this.mime.lookupExtension(extname(filename));

  function loadResponseData(callback) {
    if (body && headers && !DEBUG) {
      callback();
      return;
    }

    console.log("loading " + filename + "...");
    fs.readFile(filename, function (err, data) {
      if (err) {
		console.log("Error loading file: " + filename + " because of " + err);
		self.internalServerError(self.REQ, self.RES, "Error loading file: " + filename + " because of " + err);
      } else {
        body = data;
        headers = { "Content-Type": content_type
                  , "Content-Length": body.length
                  };
        if (!DEBUG) headers["Cache-Control"] = "public";
        // console.log("static file " + filename + " loaded");
        callback();
      }
    });
  }

  return function (req, res) {
    loadResponseData(function () {
      res.writeHead(200, headers);
      res.end(req.method === "HEAD" ? "" : body);
    });
  }
};
JS.prototype.setIP = function(address) {
  var self = this;
  self.address = address;
};

JS.prototype.listenHttpWS = function (host, port) {
	var self = this;
	if (!port) port = self.CONFIG['HTTPWS_PORT'];
	if (!host) host = self.CONFIG['LISTEN_ON_ADDRESS'];
	console.log('Listening on host: ' + host + ' port: ' + port);
	JS.server.listen(port, host, function() {
		JS.address = JS.server.address().address;
		if (JS.address == '0.0.0.0') {
			getNetworkIP(function (error, ip) {
			    if (!error) {
  					JS.address = ip;
            //
            // OK at this point to set our real address since we are already bound to '0.0.0.0'
            //
            self.setIP(ip);
  					console.log('Started server on IP address: ', JS.address);
			    } else {
					console.log('error:', error);
					self.MSGS.push(new Date() + ', error:' + error);
				}
			}, false); 
		  }
		console.log("Server at http://" + (host || "127.0.0.1") + ":" + port.toString() + "/");
	});
};

JS.prototype.close = function () { 
	JS.server.close(); 
};

JS.prototype.listenSocketIO = function(servicehandler) {
	if (JS.server) {
		try { // Try not to let this fall out the bottom if we have an issue with the service handler implementation or any funky stuff with socket.io
			if (!servicehandler) servicehandler = defaultJSHandler;
			JS.io.sockets.on('connection', servicehandler);
			console.log("Set connection to socket.io");
		} catch(e) {
			var mess = "Caught a server-side Node.js exception.  Ouch!  Here's what happened: " + e.name + ". Error message: " + e.message;
			console.error(mess);
			self.MSGS.push(new Date() + ',' + mess);
		}
	} else {
		console.error("server global is not defined");
		self.MSGS.push(new Date() + ',' + "server global is not defined");
	}
};

JS.prototype.create = function(host, port) {
	var self = this;
	if (host) self.CONFIG['LISTEN_ON_ADDRESS'] = host;
	if (port) self.CONFIG['HTTPWS_PORT'] = port;
	
	JS.server = createServer(function(req, res) {
			try {
				self.REQ = req;
				self.RES = res;
				if (req.method === "GET" || req.method === "POST" || req.method === "HEAD") {
					var handler;
					handler = self.ROUTE_MAP[url.parse(req.url).pathname];
					if (!handler) {
						for (var expr in self.RE_MAP) {
							// console.log('Test ' + req.url + ' against expr: ' + expr);
							if (self.RE_MAP[expr] && self.RE_MAP[expr].test(url.parse(req.url).pathname)) {
								handler = self.ROUTE_MAP[self.RE_MAP[expr].toString()];
								break;
							} else {
								// console.log(req.url + ' route not found.  call notFound handler');
								handler = self.notFound;
							}
						}
					}
				} else {
					handler = self.notImplemented;
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
				var mess = "Caught a server-side Node.js exception.  Ouch!  Here's what happened: " + e.name + ". Error message: " + e.message;
				console.error(mess);
				self.MSGS.push(new Date() + ',' + mess);
				self.internalServerError(req, res);
			}

	});
	console.log('Setting up socket.io namespace');
	var io = require('socket.io').listen(JS.server);
	JS.io = io; // XXX Funky, but I don't see a clean way require the io namespace inside the application wrapper.

	// Init default routes
	self.init();
	
	// Setup default handler if needed
	if (!JS.js_handler) {
		JS.js_handler = JS.DEFAULT_JS_HANDLER;
	}
};

/**
  * JumboSocket Default Routes
 */
JS.prototype.init = function() {
	var self = this;
	self.get("/", this.staticHandler("index.html"));
	self.get("/index.html", this.staticHandler("index.html"));
	self.getterer("/css/[\\w\\.\\-]+", function(req, res) {
		return self.staticHandler("." + url.parse(req.url).pathname)(req, res);
	});
	self.getterer("/js/[\\w\\.\\-]+", function(req, res) {
		return self.staticHandler("." + url.parse(req.url).pathname)(req, res);
	});
	self.getterer("/images/[\\w\\.\\-]+", function(req, res) {
		return self.staticHandler("." + url.parse(req.url).pathname)(req, res);
	});
	
	self.get("/about", function(req, res) {
		var body = self.CONFIG['VERSION_TAG'] + ': ' + self.CONFIG['VERSION_DESCRIPTION'];
		res.writeHead(200, {
		  'Content-Length': body.length,
		  'Content-Type': 'text/plain'
		});
		res.write(body);
		res.end();
	});
}


/**
  * Utility Routines
  */
function extname (path) {
  var index = path.lastIndexOf(".");
  return index < 0 ? "" : path.substring(index);
}

/** 
	getNetworkIP()
	
	Similar problem and similar answer found on python, drop down to os process and figure it out
	by sniffing off ifconfig.  May be tricky if you are looking for wireless interface, so probably
	would need to grab my code from python to remember what I did there that was clever.
	
	Code Borrowed from contribution by pumbaa80
	Thanks Stackoverflow: http://stackoverflow.com/posts/3742915/revisions
**/
var getNetworkIP = (function () {
    var ignoreRE = /^(127\.0\.0\.1|::1|fe80(:1)?::1(%.*)?)$/i;

    var exec = require('child_process').exec;
    var cached;    
    var command;
    var filterRE;

    switch (process.platform) {
    // TODO: implement for OSs without ifconfig command
    case 'darwin':
         command = 'ifconfig';
         filterRE = /\binet\s+([^\s]+)/g;
         // filterRE = /\binet6\s+([^\s]+)/g; // IPv6
         break;
    default:
         command = 'ifconfig';
         filterRE = /\binet\b[^:]+:\s*([^\s]+)/g;
         // filterRE = /\binet6[^:]+:\s*([^\s]+)/g; // IPv6
         break;
    }

    return function (callback, bypassCache) {
         // get cached value
        if (cached && !bypassCache) {
            callback(null, cached);
            return;
        }
        // system call
        exec(command, function (error, stdout, sterr) {
            var ips = [];
            // extract IPs
            var matches = stdout.match(filterRE);
            // JS has no lookbehind REs, so we need a trick
            for (var i = 0; i < matches.length; i++) {
                ips.push(matches[i].replace(filterRE, '$1'));
            }

            // filter BS
            for (var i = 0, l = ips.length; i < l; i++) {
                if (!ignoreRE.test(ips[i])) {
                    //if (!error) {
                        cached = ips[i];
                    //}
                    callback(error, ips[i]);
                    return;
                }
            }
            // nothing found
            callback(error, null);
        });
    };
})();

/**
  * Error Routines
  */
JS.prototype.internalServerError = function(req, res, msg) { // XXX Add a nicely formatted version!
	// XXX For some reason, this always returns garbage: 22 Internal Server Error.  Oh psh
	// Need to debug this!
	var self = this;
	
	if (msg) {
		msg = INTERNAL_SERVER_ERROR + "  Reason: " + msg;
	} else {
		msg = INTERNAL_SERVER_ERROR;
	}
	util.error(INTERNAL_SERVER_ERROR + ' on: ' + req.url);
	res.writeHead(500, {  'Content-Type': 'text/plain',
					'Content-Length': msg.length
	                   });
	res.write(msg);
	// util.log(util.inspect(self.ROUTE_MAP, true, null)); // XXX Dump the getMap to the logs
	res.end();
}

JS.prototype.notImplemented = function(req, res) { // XXX Add a nicely formatted version!
	util.error(NOT_IMPLEMENTED_ERROR);
	res.writeHead(501, {  'Content-Type': 'text/plain',
					'Content-Length': NOT_IMPLEMENTED_ERROR.length
	                   });
	res.write(NOT_IMPLEMENTED_ERROR);
	res.end();
}

JS.prototype.notFound = function(req, res) {
	util.error(NOT_FOUND_ERROR);
	res.writeHead(404, {  'Content-Type': 'text/plain',
					'Content-Length': NOT_FOUND_ERROR.length
	                   });
	res.write(NOT_FOUND_ERROR);
	res.end();
}

/**
 * This is a basic handler.  XXX Clean it up.  It's messy and not clear what is the purpose.
 * For now, just use it as is.  It pongs back messages.
 *
 */
function defaultJSHandler(client) {
	// 
	// PLUG IN YOUR OWN SOCKET.IO HANDLERS HERE
	// This can be removed when you decide you want it to do something useful
	//
	console.log("*********** default listenSocketIO handler ******************");	
	client.on('message', function(data) {
		if (data) {
			console.log('socket client.on message data = ' + JSON.stringify(data) + '  at ' + (new Date().getTime()));
			JS.io.sockets.send("pong - " + JSON.stringify(data));
 		} else { console.err("empty message"); } // Ignore empty data messages
	});	
	// XXX This dies with socket.io v0.7 .  Handling of broadcast is different.
	setInterval(function() { // This could be a tweet stream, game status updates, robot messages
		console.log('sending something on the socket');
		if (JS.io) { // XXX Shouldn't this exist?
			JS.io.sockets.send("Ya'll ready for this");
		}
	}, 10000);
}



// sys.inherits(JS, events.EventsEmitter);
