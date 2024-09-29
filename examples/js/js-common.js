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
$(document).ready(function() {
	// var socket = io.connect('localhost', { }); 
	var socket = io.connect();
	var connectcount = 0;
	var disconnectcount = 0;
	var messagecount = 0;
	var sentmessagecount = 0;

	socket.on('connect', function(){
		connectcount = connectcount + 1;
		$('#connectstats').text(connectcount);
	});
	socket.on('disconnect', function(){
		disconnectcount = disconnectcount + 1;
		$('#disconnectstats').text(disconnectcount);
	});
	socket.on('message', function(message){
		console.log(message);
		messagecount = messagecount + 1;
		$('#messagestats').text(messagecount);
	});

	$('#send').click(function() {
		// socket.send("{msg: 'session@default' , op: 'handshake', payload: 'hello'}");
		socket.json.send({'msg': 'session@default' , 'op': 'handshake', 'payload': 'hello'});
		sentmessagecount = sentmessagecount + 1;
		$('#sentmessagestats').text(sentmessagecount);
		return false;
	});
});
