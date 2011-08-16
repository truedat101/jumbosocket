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
		socket.send('Send a generic message');
		sentmessagecount = sentmessagecount + 1;
		$('#sentmessagestats').text(sentmessagecount);
		return false;
	});
});
