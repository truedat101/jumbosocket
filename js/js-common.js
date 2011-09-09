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
		if (message.op && (message.op == "share")) {
			alert('Received request to share content with CCNX name: ' + message.payload);
		} 
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
	
	$('#share_content').click(function() {
		// socket.send("{msg: 'session@default' , op: 'handshake', payload: 'hello'}");
		socket.json.send({'msg': 'session@default' , 'op': 'share', 'payload': 'ccnx:/%C1.M.S.localhost/%C1.M.SRV/ccnd/KEY/%C1.M.K%00tu%F4%0D%CE%1E%17%15%BEQ%23%0D%26%82%5B%2A%2A%2F%E7p%93P%C7%D6%D1%87%AC%D3%E8%1E%00%DE/%FD%04%E6%9E%8D%DA%1A/%00'});
		return false;
	});
});
