var express = require('express'); 
var app = express();
var path = require('path'); 
var http = require('http');
var server = http.createServer(app);  
var io = require('socket.io').listen(server);
//var messenger = require(__dirname + '/modules/channels.js')(io, "Manager");

//app.set('port' , 3000); 
server.listen(8080); 

app.use(express.static(path.join(__dirname ,'front_end/assets/js/ClientMessenger'))); 
app.get('/', function (req, res) {
    res.sendFile(__dirname + '/front_end/assets/js/ClientMessenger/index.html');
});


var ClientTab = []; 

io.on('connection', function(socket) {
	
	console.log('a client connected');
	io.emit('clientTabUpdate' , ClientTab); 

	//disconnect update clientTab
	socket.on('register', function (msg) {
		registerClient(socket, msg); 
	}); 
	socket.on('manager', function (msg) {
		io.emit('manager' , msg); 
	}); 
	socket.on('reducer', function (msg){
		io.emit('reducer' , msg); 
	}); 
	socket.on('worker', function (msg) {
		var recip = msg.id; 
		if (recip !=null ) {
			for (x in recip) {
				console.log("relay to " + data.id[x]); 
				io.to(data.id[x]).emit("relay", data);	
			}
		}
		else {
			io.emit('worker', msg); 
		}
	});
}); 

function registerClient(socket, msg) {
	ClientTab.push({
			sockid: socket.id, 
			status: "idle", 
			role: msg.sender
		});
	io.emit('clientTabUpdate' , ClientTab); 
}

