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
var bodyParser  = require('body-parser');
var morgan      = require('morgan');
var mongoose    = require('mongoose');
var jwt    = require('jsonwebtoken'); 
var User   = require(__dirname + '/models/user'); // get our mongoose model
var Group = require(__dirname + '/models/group');
var _  = require("lodash"); 
var gm = require(__dirname + '/modules/GroupManager.js'); 
var Vorker = require(__dirname + '/modules/User.js'); 
var JobSchema = require(__dirname + '/models/job.js');


var ClientTab = [];  
var GroupManager = new gm(Group); 

var apiRoutes = express.Router(); 
app.use(express.static(__dirname + '/front_end'));
mongoose.connect(config.mongodb.url);

app.use(morgan('dev'));

app.set('secret', config.secret); 	//TODO make this a random secret for production
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());



server.listen(8080); 

//angular app
app.get('/', function (req, res) {
    res.sendFile(__dirname + '/front_end/index.html');
});

//API
app.use('/api', apiRoutes);


//middleware to verify tokens 
apiRoutes.use(function(req, res, next) {
	var token = req.body.token || req.query.token || req.headers['x-access-token'];

	// decode token
	if (token) {
		// verifies secret and checks exp
		jwt.verify(token, app.get('secret'), function(err, decoded) {      
		if (err) {
			console.log('couldnt verify token');
			return res.json({ success: false, error : err});    
		} 
		else {
			// if everything is good, save to request for use in other routes
			req.decoded = decoded;    
			console.log(req.decoded._doc.data);
			next();
		}
	});

	} 
	else {
		return res.status(403).send({ 
			success: false, 
			message: 'No token provided.' 
		});
	}
});


apiRoutes.post('/registerGroup', function(req,res) {
	var user = req.decoded._doc.data;
	var name = req.body.name;
	var newGroup = new Group({
		users : [user.email],
		admins : [user.email],
		name : name,
		jobs : []
	});
	
	newGroup.save(function(err) {
		if(err) {
			console.log(err);
			res.json({success : false, error : err});
		}
		res.json({success : true });
	});

	User.findOne({'data.email': user.email}, function(err, doc) {
			doc.data.groups.push(name);
			doc.save();
	});


})


app.post('/registerUser', function(req,res) {
	var data = req.body;
	var newUser = new User({ 
		data : {
			name: data.name, 
			email: data.email
		},
		pw: data.pw
	});

	// save the new user
	newUser.save(function(err) {
		if (err) {
			console.log(err);
			res.json({success: false, error : err});
		}
		res.json({ success: true });
  	});
});

apiRoutes.get('/groups', function(req,res) {
	Group.find({}, function(err, groups) {
		if(err){
			console.log(err);
			res.json({success : false, error : err});
		}
		res.json({success : true, groups : groups});
	});

});

apiRoutes.post('/InputFiles', function (req, res) {
    fileUpload.upload(req,res,function(err){
        //send response to client
		var dir = path.join(__dirname,config.multer.path,req.body.type);
		if(!fs.existsSync(dir)){
             fs.mkdirSync(dir);
        }

        if(err){
                res.json({error_code:1,err_desc:err});
                return;
        }

        res.json({error_code:0,err_desc:null});
        fs.renameSync(req.file.path,path.join(dir, req.file.filename));
		console.log(req.body);

		//just send path to data file
		var payload = {type : req.body.type, data : path.join(dir,req.file.filename), group_id: req.body.group, job_id: req.body.job};
		io.emit('UploadedFile', payload);
    })
});


apiRoutes.get('/user', function(req, res) {
	var email = req.decoded._doc.data.email;
	User.findOne({'data.email' : email }, function(err,doc) {
		if(!err)
			res.json(doc.data);
	});
});   

apiRoutes.get('/group', function(req,res) {
	//TODO
});


apiRoutes.post('/registerJob', function(req,res) {
	console.log(req.decoded._doc.data.email);
	var newJob = new JobSchema({
		name: req.body.id,  
    	owners: [req.decoded._doc.data.email], 
		group : req.body.group,
    	map : null,       
    	reduce: null,     
    	status: null,     
    	results: null,    
    	splits : [],   
    	data: null
	});
	newJob.save(function(err) {
		if(err) {
			console.log(err);
			res.json({success : false, error : err});
		}
		res.json({success : true });
	});
});


apiRoutes.post('/joinGroup', function(req,res) {
	//TODO jupdate groupManager
	//update user and group documents
	var user = req.decoded._doc.data;
	var data = req.body;
	var sent = false;
	var result = {
		'group' : null,
		'user' : null
	}

	//update user and group documents
	Group.findOne({name: data.group}, function(err,doc) {
		var users = doc.users;
		if(users.indexOf(user.email) > -1) {
			console.log("already in group");
			result.group = {success:false, error: "already in group"};
		}
		else {
			doc.users.push(user.email);
			doc.save();
			result.group = {success:true};
		}

		//check to see if we need to send response
		if(sent == false && result.user != null) {
			res.json(result);
			sent = true;
		}
	});

	User.findOne({'data.email': user.email}, function(err, doc) {
		var groups = doc.data.groups;
		if(groups.indexOf(data.group) > -1){
			console.log("already in group");
			result.user = {success: false, error: "already in group"};
		}
		else{
			//save group to user
			doc.data.groups.push(data.group);
			doc.save();
			result.user = {success:true};
		}

		//check to see if we need to send response
		if(sent == false && result.group != null) {
			res.json(result);
			sent = true;
		}
	});
	
});

app.post('/authenticate', function(req, res) {
	// find the user
	console.log(req.body);
	
	User.findOne({'data.email' : req.body.email}, function(err, user) {
		if (err) 
			throw err;

		if (!user) {
			res.json({ success: false, message: 'User not found.' });
		} 
		else {
			
			if (user.pw != req.body.password) {
				res.json({ success: false, message: 'Wrong password.' });
			} 
			else {
				// create a token
				var token = jwt.sign(user, app.get('secret'), {
					expiresIn: 60 * 60 * 24 * 10 // expires in 10 days
				});

				//send token
				res.json({
					success: true,
					token: token,
					user : user.data
				});
			}   
		}

  	});
});




//socket server stuff
io.on('connection', function(socket) {
	
	//console.log('a client connected');
	io.emit('clientTabUpdate' , ClientTab); 
	io.emit('gmUpdate', GroupManager); 


	socket.on('register', function (msg) {
		
		registerClient(socket, msg); 
		GroupManager.dump();
	}); 
	socket.on('manager', function (msg) {
		io.emit('manager' , msg); 
	}); 
	socket.on('reducer', function (msg){
		io.emit('reducer' , msg); 
	}); 
	socket.on('worker', function (msg) {
		var recip = msg.id;
		//console.log(recip);
		if (recip != null ) {
			for (x in recip) {
				//console.log("relay to " + msg.id[x]); 
				io.to(msg.id[x]).emit("worker", msg);	
			}
		}
		else {
			//console.log("CREAM");
			io.emit('worker', msg); 
		}
	});
	socket.on('disconnect' , function (){
		for (x in ClientTab) {
			if (ClientTab[x].sockid == socket.id) {
				ClientTab.splice(x,1); 
			}
		}
		// console.log('A client disconnected'); 
		// console.log(ClientTab); 
		GroupManager.removeUser(socket.id);
		GroupManager.dump();
		io.emit('clientTabUpdate' , ClientTab);
	}); 
	socket.on('server', function (msg){
		if (msg.topic=="MapReduce") {
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



	if (msg.sender.toLowerCase() == "worker") {
		/*msg.data = {
			id: Id, 
			groups: Groups
		}; */ 
		var user =  new Vorker(socket.id, msg.data); 
		console.log(user);
		GroupManager.registerUser(user); 
		io.emit('gmUpdate', GroupManager); 
	}

	
	
}



