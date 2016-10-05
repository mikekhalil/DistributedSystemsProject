//require stuff
var express = require('express');
var app = express();
var fileUpload = require(__dirname + '/modules/FileUpload.js');
var fs = require('fs');
var config = require('./config.json');
const path = require('path');
var http = require('http');
var server = http.createServer(app);  
var io = require('socket.io').listen(server);


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

		
		var file = fs.readFileSync(path.join(dir,req.file.filename), "utf8");
		var payload  = {type : req.body.type, data : file};
		io.emit('initialize', payload);
    })
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
	socket.on('disconnect' , function (){
		for (x in ClientTab) {
			if (ClientTab[x].sockid == socket.id) {
				ClientTab.splice(x,1); 
			}
		}
		console.log('disconnect'); 
		console.log(ClientTab); 
		io.emit('clientTabUpdate' , ClientTab);
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


