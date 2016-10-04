
var socket = require('socket.io-client')('http://localhost:8080'); 
var messenger = require(__dirname + '/modules/messenger.js')(socket, "manager");

socket.on('connect', function() {
	messenger.printConnections(); 
	var data =  "00000000000"+
				"00000000000"+
				"00000000000"+
				"00000000000"+
				"00000000000"+
				"00000000000"+
				"00000000000"+
				"00000000000"+
				"00000000000"+
				"00000000000"+
				"00000000000"+
				"00000000000"+
				"00000000000"+
				"00000000000"+
				"00000000000"+
				"00000000000"+
				"00000000000"+
				"00000000000"+
				"00000000000"+
				"00000000000";


		messenger.publishTo("reducer", "Testing", data); 

	
	console.log("done"); 
}); 