/*
*Messenger.js - postal.js channel endpoint for socket.io inflection server
*Author: Sameet Mohanty
*/

var postal = require("postal");
var _  = require("lodash"); 
var config = require(__dirname + '/../config.json');

/*
Module.ClientTab is a table of connected clients (connected to the inflection server)
Module.ClientTab[n] =  
{
	sockid: socket id, 
	status: idle, active, dc 
	role: worker, manager, reducer
}

Outgoing and incoming messages are wrapped in a struct 
MessageWrapper = {
	data: original message, 
	sender:  (string), 
	reciever: (string), 
	topic: topic (string), 
	id: recipient sockids(arr) (0 for broadcast) 
} 

channelname can be anything. However the inflection server route messages
for  'manager', 'reducer' , 'worker' and 'server'. 
*/ 

module.exports = function (socket, channelname){
	var module = {}; 
	module.ClientTab = []; 

	/*channels for incoming and outgoing traffic*/
	module.inchannel = postal.channel("in" + channelname); 
	module.outchannel  = postal.channel("out" + channelname); 

	/*route outgoing messages to socket.io server*/ 
	module.outchannel.subscribe("outgoing", function (data) {
		//console.log("outgoing"); 
		/*console.log(data.id);
		console.log(data.data.inputSplit);
		
		console.log('=-=-=-=-=');*/
		socket.emit(data.reciever, data); 
    });
	/*recieve incoming messages and re-establish original topic*/ 
    module.inchannel.subscribe("incoming", function (data) {
    	//console.log("incoming"); 
		console.log(data.data.sockid);
		console.log(data.data.inputSplit);
		console.log('=-=-=-=-=-=-=-');
    	module.inchannel.publish(data.topic, data); 
    }); 
    /*publish array of sockids as recipients*/ 
    module.publishToSelectedWorkers = function (recipient, topic,data) {
		
		data = wrapData(channelname, "worker" ,topic, recipient, data); 
		module.outchannel.publish( "outgoing", data);
	}
	/*publish to workers with selected status*/
	module.publishToStatusWorkers = function (status, topic, data) {
		if (status!='idle' && status!='active') {
			console.log("ERROR: Invalid Status. Options: idle, active");
		}
		var recip = []; 
		for (var i in module.clientTab) {
			if(module.clientTab[i].status==status && module.clientTab[i].role =="worker") {
				recip.push(module[i].clientTab.sockid); 
			}
		}
		data = wrapData(channelname, "worker", topic, recip, data); 
		module.outchannel.publish( "outgoing", data); 
	}
	/*General publish call. When worker is selected, all connected workers will get msg.*/ 
	module.publishTo = function (recipient, topic, data) {
		recipient = _.toLower(recipient); 
		var intersect = _.intersection(config.components, [recipient]);
		if (intersect.length!=1) {
			console.log('ERROR: Invalid recipient'); 
			return; 
		}
		data = wrapData(channelname, recipient, topic, null, data); 
		module.outchannel.publish("outgoing", data); 
	}
	module.publishToAll = function (topic, data) {
		for (var i in config.components) {
			data = wrapData(channelname, config.components[i], topic, null, data); 
			module.outchannel.publish("outgoing", data); 
		}
	}
	/*Returns Array of Idle workers*/
	module.getIdleWorkers = function () {
		var idle = []; 
		for (var i in module.ClientTab) {
			if (module.ClientTab[i].role=="worker" && module.ClientTab[i].status=="idle")
				idle.push(module.ClientTab[i].sockid); 
		}
		return idle; 
	}


	/*print clientTab*/ 
	module.printConnections = function () {
		console.log("Inflection Server connected to ...")
		for (var i in module.ClientTab) {
			console.log(module.ClientTab[i].role +" at sockId " + module.ClientTab[i].sockid); 
		}
	}
	
	/*recieve incoming messages*/ 
	socket.on(channelname, function(msg){	
		module.inchannel.publish("incoming", msg); 
	}); 

	/*register self*/
	socket.on('connect', function() {
		var msg= {};  
		msg = wrapData(channelname, "", "", "", msg); 
		socket.emit('register', msg); 
	}); 
		 
	/*recieve update client tab from socketserver 
	ISSUE: error checking is dog shit
	*/ 
	socket.on('clientTabUpdate' , function(msg) {
		module.ClientTab = msg; 
	}); 

	return module;
};

/*wrap msg for sending*/ 
function wrapData(sender, reciever ,topic, sockid, data) {
	var newdata = {}; 
	newdata.sender = sender; 
	newdata.reciever = reciever; 
	newdata.topic = topic; 
	newdata.id = sockid; 
	newdata.data  = data; 
	return newdata;
 }

/*CHANGE/ISSUE LOG 
* 1) Need some mechanism to ensure clientTab has been recieved before outgoing 
* is enabled. Otherwise initial outgoing traffic may be lost. 
*/

