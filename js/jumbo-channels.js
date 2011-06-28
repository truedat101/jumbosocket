/**
#Created by David J. Kordsmeier on 2011-01-30.
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
var presenter = 'me';
var slideno = 0;

$(document).ready(function() {
	$('#presenter').text(presenter);
	var socket = new io.Socket('0.0.0.0', { // XXX This is a hassle, what is the best way to configure?
	}); 
	
	socket.connect();
	socket.on('connect', function(){
		// XXX Do something
		console.log("connected");
	});
	socket.on('disconnect', function(){
		// XXX Do something
		console.log("disconnected");
	});
	socket.on('message', function(data){
		console.log("message");
		if (data) {
			if (data.msg == 'session') {
				if (data.op == 'handshake') {
					console.log("handshake performed");
					socket.send({msg: 'session@' + getChannel(), op: 'handshake', payload: 'hello'});
				}
			}
		} // Ignore empty messages
	});

	$('#send').click(function() { // XXX TODO do something here
		socket.send('Send a generic message');
		return false;
	});
	
	if (isPresenter()) {
		console.log('glider is a presenter = ' + isPresenter());
	}
});

function addGrowlNotification(title, text, imagepath, time, sticky, classname) {
	// XXX Come up with some kind of growl style notificication
	return false;
}
