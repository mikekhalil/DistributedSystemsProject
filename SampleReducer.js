// require stuff

var socket = require('socket.io-client')('http://localhost:8080'); 
var messenger = require(__dirname + '/modules/messenger.js')(socket, "reducer");


socket.on('connect', function() {
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

	// for (var i=0; i<10000; i++) {
	// 	messenger.publishToManager("Testing", data); 
	// }
	
	console.log("done"); 
}); 