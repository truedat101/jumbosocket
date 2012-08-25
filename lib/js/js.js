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
  js.js a small server for big ideas, offering a small template starter project,

  - fu.js: from the node_chat demo, source of major inspiration
  - socket.io: to handle socket oriented communication
  - node.js: for the runtime
 */



/**
 * Imports
 */
var assert = require('assert');
var fs = require('fs');
var url = require('url');
var querystring = require('querystring');
var path = require('path');
var createServer = require('http').createServer;

/**
  * CONFIG
  *
  */
js.DEBUG = true;

js.CONFIG = {
	'PORT':8000,
	'HOST': 'localhost',
	'VERSION_TAG':'0.1.0',
	'VERSION_DESCRIPTION':'Put your app description here'
};

/**
 * js.js - jumbosocket
 *
 */
js.ROUTE_MAP = {
  'GET' : {},
  'POST' : {},
  'PUT' : {}
}; // Populate this with the App Routes you set up
js.RE_MAP = {
  'GET' : {},
  'POST' : {},
  'PUT' : {}
}; // Populate this with the App Routes you set up
js.address = '0.0.0.0'; // If you don't want this exposed on a network facing IP address, change to 'localhost'
js.channels = {}; // XXX Should move to using socket.io namespaces

js.info = function info(message) {
  if (!process.env['TEST']) {
    console.info(message);
  }
}

js.error = function info(message) {
  if (!process.env['TEST']) {
    console.error(message);
  }
}

js.debug = function info(message) {
  if (process.env['DEBUG']) {
    console.info(message);
  }
}

if (js.DEBUG) {
	js.info("TURN OFF DEBUG for Production");
}

registerRoute = function(path, handler, method, regexp) {
  var myHandler = function(req, res) {
    js.info("Handling: " + req.method + " " + req.url);
    handler(req, res);
    // console.info(req.body);
  }
  var regexp = regexp || false;
  if (regexp) {
    path = path.replace(':id', '\([_a-zA-Z0-9\.-]+\)');
    repath = RegExp('^' + path + '$');
    js.RE_MAP[method][path] = repath;
    js.ROUTE_MAP[method][repath] = myHandler;
  } else {
    js.ROUTE_MAP[method][path] = myHandler;
  }
};

js.get = function(path, handler, regexp) {
  registerRoute(path, handler, 'GET', regexp);
};

js.put = function(path, handler, regexp) {
  registerRoute(path, handler, 'PUT', regexp);
};

js.post = function(path, handler, regexp) {
  registerRoute(path, handler, 'POST', regexp);
};

js.parsers = {};

js.parseEncoded = js.parsers['application/x-www-form-urlencoded'] = function(req, res, func) {
  var buf = '';
  var func = func;
  req.on('data', function(chunk) {
    buf += chunk
  });
  req.on('end', function() {
    // console.info("<-- RECEIVING: " + buf);
    req.body = querystring.parse(buf);
    func(req, res);
  });
};

js.parseJSON = js.parsers['application/json'] = function(req, res, func) {
  var buf = '';
  var func = func;
  req.on('data', function(chunk) {
    buf += chunk
  });
  req.on('end', function() {
    // console.info("<-- RECEIVING: " + buf);
    if (!buf) {
      return handleError(js.JumboError.unexpected(req.method + ' with empty data is not allowed.'));
    }
    req.body = JSON.parse(buf);
    func(req, res);
  });
};

js.mime = {
  // returns MIME type for extension, or fallback, or octet-steam
  lookupExtension : function(ext, fallback) {
    return js.mime.TYPES[ext.toLowerCase()] || fallback || 'application/octet-stream';
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

js.staticHandler = function(filename) {
  var body, headers;
  var content_type = js.mime.lookupExtension(extname(filename));
  filename = path.join(__dirname + '/../' + 'static', filename); // The path is actually lib, not project root
  function loadResponseData(req, res, callback) {
    if (body && headers && !js.DEBUG) {
      callback();
      return;
    }

    fs.readFile(filename, function(err, data) {
      if (err) {
        res.handleError(JumboError.notFound("The requested URL " + req.url + " was not found on this server."));
      } else {
        body = data;
        headers = {
          "Content-Type" : content_type,
          "Content-Length" : body.length
        };
        if (!js.DEBUG)
          headers["Cache-Control"] = "public";
        callback();
      }
    });
  }

  return function(req, res) {
    loadResponseData(req, res, function() {
      res.writeHead(200, headers);
      res.end(req.method === "HEAD" ? "" : body);
    });
  }
};

js.listenHttpWS = function(server, port, host) {
	server.listen(port, host);
	js.info("Server at http://" + (host || "127.0.0.1") + ":" + port.toString() + "/");
};

js.close = function(server) {
	server.close();
};

registerRoute("/[\\w\\.\\-]+", function(req, res) {
  return js.staticHandler("." + url.parse(req.url).pathname)(req, res);
}, 'GET', true);

registerRoute("/css/[\\w\\.\\-]+", function(req, res) {
	return js.staticHandler("." + url.parse(req.url).pathname)(req, res);
}, 'GET', true);

registerRoute("/apps/[\\w\\.\\-]+", function(req, res) {
	return js.staticHandler("." + url.parse(req.url).pathname)(req, res);
}, 'GET', true);

registerRoute("/js/[\\w\\.\\-]+", function(req, res) {
	return js.staticHandler("." + url.parse(req.url).pathname)(req, res);
}, 'GET', true);

registerRoute("/images/[\\w\\.\\-]+", function(req, res) {
	return js.staticHandler("." + url.parse(req.url).pathname)(req, res);
}, 'GET', true);



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

js.ERROR_UNEXPECTED = 'unexpected';
js.ERROR_NOT_FOUND = 'notFound';

JumboError = {};

JumboError.notFound = function notFound(message) {
  var error = new Error(message);
  error.type = js.ERROR_NOT_FOUND;
  return error;
}

JumboError.unexpected = function unexpected(message) {
  var error = new Error(message);
  error.type = js.ERROR_UNEXPECTED;
  return error;
}

js.JumboError = JumboError;

js.HttpError = function HttpError(err, req, res) {
  this.message = err.message;
  this.type = err.type;
  this.stack = err.stack;
  this.error = err;
  switch (err.type) {
  case js.ERROR_NOT_FOUND:
    this.code = 404;
    break;
  default:
    this.code = 500;
    break;
  }
  this.request = req;
  this.response = res;
}

js.HttpError.prototype.handle = function handle() {
  var req = this.request;
  var res = this.response;
  var e = this.error;
  var f = js.sendJSON(req, res);
  var code = this.code || 500;
  var r = {};
  r['message'] = this.message;
  // r['stack'] = this.stack;
  f(code, r)

  switch (code) {
  case 404:
    js.info("Warning: " + this.message);
    break;
  default:
    js.error("Error handling: " + req.method + " " + req.url + ", Details:");
    js.error(e);
    if (e.stack) {
      js.error(e.stack);
    }
  }
}

/**
  * JumboSocket Service Handler - Define your App Here
  */
js.get("/", js.staticHandler("index.html"));

js.get("/about", function(req, res) {
	var body = js.CONFIG['VERSION_TAG'] + ': ' + js.CONFIG['VERSION_DESCRIPTION'];
	res.writeHead(200, {
	  'Content-Length': body.length,
	  'Content-Type': 'text/plain'
	});
	res.write(body);
	res.end();
});

js.sendText = function(req, res) {
  return function(code, body) {
    res.writeHead(code, {
      "Content-Type" : "text/plain",
      "Content-Length" : body.length
    });
    res.end(body);
  }
};

js.sendJSON = function(req, res) {
  return function(code, obj) {
    var body = JSON.stringify(obj);
    res.writeHead(code, {
      "Content-Type" : "application/json",
      "Content-Length" : body.length
    });
    // console.info("--> SENDING: " + body);
    res.end(body);
  }
};

js.server = createServer(function(req, res) {
  res.handleError = handleError = function(error) {
    var httpError = new js.HttpError(error, req, res);
    httpError.handle();
  };

  try {
    var handler;
    var pathName = url.parse(req.url).pathname;
    var routeMap = js.ROUTE_MAP[req.method];
    handler = routeMap[pathName];
    if (!handler) {
      var reMap = js.RE_MAP[req.method];
      for (var path in reMap) {
        var expression = reMap[path];
        if (expression && expression.test(pathName)) {
          req.id = RegExp.$1;
          handler = routeMap[expression];
          break;
        }
      }
      if (!handler) {
        return handleError(js.JumboError.notFound('Not found: ' + pathName));
      }
    }

    res.sendText = js.sendText(req, res);
    res.sendJSON = js.sendJSON(req, res);

    if (handler) {
      if (req.method === 'PUT' || req.method === 'POST') {
        var contentType = req.headers['content-type'];
        var parser = js.parsers[contentType];
        if (!parser) {
          return handleError(js.JumboError.unexpected("Invalid content-type: " + contentType));
        }
        parser(req, res, handler);
      } else {
        handler(req, res);
      }
    }

  } catch (e) {
    handleError(e);
  }
});

js.restart = function() {
  server.close();
  server.runServer(js.CONFIG['PORT']);
}

process.on('uncaughtException', function(e) {
  js.error("\nCaught a server-side Node.js exception.  Here's what happened: " + e.name + ". Error message: " + e.message
      + "\nStack:\n" + e.stack);
  js.info("Server is going to be restarted.");
  js.restart();
});

js.server.runServer = function runServer(port) {
  js.listenHttpWS(this, port, js.CONFIG['HOST']);
}
