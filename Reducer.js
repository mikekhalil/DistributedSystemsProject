var socket = require('socket.io-client')('http://localhost:8080'); 
var messenger = require(__dirname + '/modules/messenger.js')(socket, "reducer"); 

socket.on('connect', function() { 

	console.log("cream!"); 	
}); 