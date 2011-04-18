Goal: The goal of Jumbosocket is to provide a boilerplate for quickstart of a node.js + socket.io app.  While this is easily possible in a few lines of JS code, it is nice to have a tested set of components to start using.  The HTML5 boilerplate is provided, along with CSS stubs, and a few JS scripts for a basic app, plus the needed JS libraries we all depend on for things.  With this setup, you should be able to get started coding in about 5 minutes or less.  This app doesn't do much, but you can at least prove your socket.io is working.  A secondary goal is that the code be short enough that you can walk through every line of the code an understand what the server is doing.  And in that spirit, it was not an objective that you have to go out and learn a framework to be productive, which can take days, weeks, months, or years.

Installation:  You need the prerequisites: 
* Node.js 0.2 x or great (not sure what Socket.io needs to work)
* NPM (recommended)
* Socket.io (install via NPM or include the source so it is available in the require path)
* Best bet is to run 'npm bundle' in the root project directory.  This will grab you the dependencies and drop them into your node_modules directory (see )
Configure:
* You can configure js.js in the config section (set host and port)
* If you plan to use Amazon AWS SimpleDB, you will need to provide your AWS Access Key ID and Secret Access Key

To run:

node js.js

If you are actively developing, install nodemon:
npm install nodemon

and then run with:

nodemon js.js


Development:
If you want to build on top of this, the best thing is to create a server.js file and require('./js.js');   Then you can just define your routes and any utility methods inside of server.js.  As I have recommended above, use nodemon or similar to speed up your dev cycles.  

Demo Routes:
	On Port 8000:
		/helloworld - A basic static html page served up by node
		/helloworldly/<some path> - A basic static html page using the route filtering feature of this server.  It will print <some path> to the screen.
		/about - about this demo
		/ - A simple socket.io demo showing basic messaging process
		
Troubleshooting:
* If you are on Mac OS X, there is a good chance you didn't build node.js with SSL enabled, mainly because there is problem at the configure phase finding an i64 based openssl library and headers.  If you get errors running this socket.io demo or any of the others, there is a good chance it is a crypto error, at runtime.  Socket.io needs the crypto enabled in Node.js.
* You may experience an issue finding xml2js on node >= 0.4.0 .  This has to do with differences in the package maintainer's packaging vs. the way node handles how to find packages in the system.

Known Issues
* Doesn't work in Firefox 4.0 (and maybe in 3.0).
* Missing test cases ... I test manually.  I would like to try out Jasmine or one of these other test frameworks.
* Not sure how to keep the versioning of socket.io up to date.  If you install Socket.IO from NPM, then you may get a later version.  Since Socket.IO documentation is very minimal outside of the code, it is tricky for me here.  I have to keep the client side library for socket.io up to date.  Probably worth hosting all of the socket client library version hosted on a CDN so that we can reference them by URL.

Suggestions and Questions:
* Post them on the google group.  I don't really know anything about socket.io and while proficient in node.js, I am not a JS developer by trade, so there are surely better and more efficient ways to code.  Send me your ideas.

Attributions:
TODO: Add links
* Node.js - Ry for creating a node we can use
* node_chat - Ry and inspiration from fu.js -> js.js
* socket.io - Guillermo Rauch
