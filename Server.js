/*requires*/
var express = require('express');
var app = express();
var fileUpload = require(__dirname + '/modules/FileUpload.js');
var fs = require('fs');
var config = require('./config.json');
const path = require('path');
var http = require('http');
var server = http.createServer(app);  
var io = require('socket.io').listen(server);
var postal = require('postal');

/*globals*/
var ClientTab = []; 

app.use(express.static(__dirname + '/front_end'));

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/front_end/index.html');
});


server.listen(8080); 

app.post('/InputFiles', function (req, res) {
    fileUpload.upload(req,res,function(err){
        //send response to client
        if(err){
                res.json({error_code:1,err_desc:err});
                return;
        }
        res.json({error_code:0,err_desc:null});
       
        //create new path and directory
        var dir = path.join(__dirname,config.multer.path,req.body.type);
        if(!fs.existsSync(dir)){
             fs.mkdirSync(dir);
        }
        fs.renameSync(req.file.path,path.join(dir, req.file.filename));

		//just send path to data file
		var payload = {type : req.body.type, data : path.join(dir,req.file.filename)};
		io.emit('UploadedFile', payload);
		
    })
});


io.on('connection', function(socket) {
	
	console.log('a client connected');
	io.emit('clientTabUpdate' , ClientTab); 

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
	socket.on('disconnect' , function (){
		for (x in ClientTab) {
			if (ClientTab[x].sockid == socket.id) {
				ClientTab.splice(x,1); 
			}
		}
		console.log('A client disconnected'); 
		console.log(ClientTab); 
		io.emit('clientTabUpdate' , ClientTab);
	}); 
	socket.on('server', function (msg){
		if (msg.topic=="StartedMapReduce") {
			for (var i in ClientTab) {
				if (ClientTab[i].sockid == socket.id)  {
					ClientTab[i].status = "active"; 
					break; 
				}
			}
			io.emit('clientTabUpdate' , ClientTab);	
		}
		else if (msg.topic=="CompletedMapReduce") {
			for (var i in ClientTab) {
				if (ClientTab[i].sockid == socket.id)  {
					ClientTab[i].status = "idle"; 
					break; 
				}
			}
			io.emit('clientTabUpdate' , ClientTab);	
		}
		else if (msg.topic=="SystemReset") {
			for (var i in ClientTab) {
				if (ClientTab[i].status == "active")  {
					ClientTab[i].status = "idle"; 
				}
			}
			io.emit('clientTabUpdate' , ClientTab);	
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
    console.log(ClientTab); 
}


