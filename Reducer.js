var socket = require('socket.io-client')('http://localhost:8080'); 
var messenger = require(__dirname + '/modules/messenger.js')(socket, "reducer"); 

socket.on('connect', function() { 

	console.log("cream!"); 	
}); 

messenger.inchannel.subscribe("SystemReset" , function(msg) {
	//do stuff to reset reducer
}); 