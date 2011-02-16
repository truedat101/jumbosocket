Goal: The goal of Jumbosocket is to provide a boilerplate for quickstart of a node.js + socket.io app.  While this is easily possible in a few lines of JS code, it is nice to have a tested set of components to start using.  The HTML5 boilerplate is provided, along with CSS stubs, and a few JS scripts for a basic app, plus the needed JS libraries we all depend on for things.  With this setup, you should be able to get started coding in about 5 minutes or less.  This app doesn't do much, but you can at least prove your socket.io is working.  A secondary goal is that the code be short enough that you can walk through every line of the code an understand what the server is doing.  And in that spirit, it was not an objective that you have to go out and learn a framework to be productive, which can take days, weeks, months, or years.

Installation:  You need the prerequisites: 
* Node.js 0.2 x or great (not sure what Socket.io needs to work)
* NPM (recommended)
* Socket.io (install via NPM or include the source so it is available in the require path)

Configure:
* You can configure js.js in the config section (set host and port)

To run:

node js.js

If you are actively developing, install nodemon:
npm install nodemon

and then run with:

nodemon js.js


Development:
If you want to build on top of this, the best thing is to create a server.js file and require('./js.js');   Then you can just define your routes and any utility methods inside of server.js.  As I have recommended above, use nodemon or similar to speed up your dev cycles.  

Troubleshooting:
* If you are on Mac OS X, there is a good chance you didn't build node.js with SSL enabled, mainly because there is problem at the configure phase finding an i64 based openssl library and headers.  If you get errors running this socket.io demo or any of the others, there is a good chance it is a crypto error, at runtime.  I don't know for sure but I think socket.io needs the crypto enabled in  Node.js.

Suggestions and Questions:
* Post them on the google group.  I don't really know anything about socket.io and while proficient in node.js, I am not a JS developer by trade, so there are surely better and more efficient ways to code.  Send me your ideas.

Attributions:
TODO: Add links
* Node.js - Ry for creating a node we can use
* node_chat - Ry and inspiration from fu.js 
* socket.io - Guillermo Rauch
