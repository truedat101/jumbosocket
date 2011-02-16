var socket = new io.Socket('localhost', {
}); 
socket.connect();
socket.on('connect', function(){
	alert('on connect');
});
socket.on('disconnect', function(){
	alert('on disconnect');
});
socket.on('message', function(){
	alert('on message');
});

$('#connect').click(function() {
	socket.send('connect');
	return false;
});
