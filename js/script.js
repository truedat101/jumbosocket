<!-- <script src="http://{node_server_url}/socket.io/socket.io.js"></script> -->
<script> 
 var socket = new io.Socket({node_server_url}); 
 socket.connect();
 socket.on('connect', function(){ … }) 
 socket.on('message', function(){ … }) 
 socket.on('disconnect', function(){ … }) 
</script>