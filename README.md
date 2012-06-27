## Goal

The goal of Jumbosocket is to provide a boilerplate for quickstart of a node.js + socket.io app.  While this is easily possible in a few lines of JS code, it is nice to have a tested set of components to start using.  The HTML5 boilerplate is provided, along with CSS stubs, and a few JS scripts for a basic app, plus the needed JS libraries we all depend on for things.  With this setup, you should be able to get started coding in about 5 minutes or less.  This app doesn't do much, but you can at least prove your socket.io is working.  A secondary goal is that the code be short enough that you can walk through every line of the code an understand what the server is doing.  And in that spirit, it was not an objective that you have to go out and learn a framework to be productive, which can take days, weeks, months, or years.

## Requirements
* Deliverable as an NPM bundle
* Users of the library simply require "js"
* Users of the library can easily add their own routes

## Installation

You can simply run 'npm install jumbosocket'

-or- 

Grab the source and install the prerequisites: 
* Node.js 0.4.x or greater (not sure what Socket.io needs to work)
* NPM (recommended)
* nLogger (used for nicer logging facilities).  This may change in the future.  Not quite sure which one to use yet, but this works for now.
* Socket.io (install via NPM or include the source so it is available in the require path) - use v0.8.x .  


## Usage

This is inteneded to use as a project template or as a module used as a middleware layer for your own projects.

As a template, just copy the source code and start building your project.  See Development section below.

As a module, require js.  

## Configure

* You can configure js.js in the config section (set host and port, and add your own conf here).  There is a better way to do config, but you probably want to choose the config mechanism that suits your tastes.

## To run

node js.js to run a default service (doesn't do much other than play pingpong with socket.io messages and serve some test routes).

If you are actively developing, install nodemon:
npm install nodemon

and then run with:

nodemon js.js

A better way: Create an server wrapper to add your own routes and socket.io handler.  

node examplejs-server.js

## Development
If you want to build on top of this, the best thing is to create a server.js file and require('./js.js');   Then you can just define your routes and any utility methods inside of server.js.  As I have recommended above, use nodemon or similar to speed up your dev cycles.  

## Demo Routes
	On Port 8000:
		/helloworld - A basic static html page served up by node
		/helloworldly/<some path> - A basic static html page using the route filtering feature of this server.  It will print <some path> to the screen.
		/about - about this demo
		/presenter - a simple group presenter tool (TODO, not implemented)
		/viewer - a simple group presentation viewer (TODO, not implemented)
		/ - A simple socket.io demo showing basic messaging process
		
## Troubleshooting

* If you are on Mac OS X (before 10.6), there is a good chance you didn't build node.js with SSL enabled, mainly because there is problem at the configure phase finding an i64 based openssl library and headers.  If you get errors running this socket.io demo or any of the others, there is a good chance it is a crypto error, at runtime.  Socket.io needs the crypto enabled in Node.js.

## Suggestions and Questions

* Post them on github.  I don't really know anything about socket.io and while proficient in node.js, I am not a JS developer by trade, so there are surely better and more efficient ways to code.  Send me your ideas.

## Release Notes
v0.1.2
-------
* Fix missing routes for default routes (/, /css, /scripts, /images)

v0.1.1 
-------
* Fix crumby implementation of JS prototype

v0.1.0
-------
* Converted project into NPM module
* Moved sample web site into examples folder

v0.0.35
-------
* Still a bunch of cruft related to the sample web site.  
* No NPM Package Still
* Incompatible with v0.6.2

v0.0.1
-------
* Doesn't work in Firefox 4.0 (and maybe in 3.0).
* Missing test cases ... I test manually.  I would like to try out Jasmine or one of these other test frameworks.
* Not sure how to keep the versioning of socket.io up to date.  If you install Socket.IO from NPM, then you may get a later version.  Since Socket.IO documentation is very minimal outside of the code, it is tricky for me here.  I have to keep the client side library for socket.io up to date.  Probably worth hosting all of the socket client library version hosted on a CDN so that we can reference them by URL.
* Probably some warnings from NPM.  I can't keep up with the rate of node=innovation.

## Attributions

TODO: Add links
* Node.js - Ry for creating a node we can use
* node_chat - Ry and inspiration from fu.js -> js.js
* socket.io - Guillermo Rauch
* Javascript - Brendan Eich
