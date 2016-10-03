/*
*Messenger.js - postal.js channel endpoint for socket.io inflection server
*Author: Sameet Mohanty
*/

var postal = require("postal");

/*
Module.ClientTab is a table of connected clients 
Module.ClientTab[n] =  
{
	sockid: socket id, 
	status: idle, active, dc 
	role: worker, manager, reducer
}

Outgoing messages are wrapped in a struct 
MessageWrapper = {
	data: original message, 
	sender:  (string), 
	reciever: (string), 
	topic: topic (string), 
	id: recipient sockids(arr) (0 for broadcast) 
} 

channelname can be anything. However the inflection server route messages
for  'manager', 'reducer' , 'worker'. 
*/ 

var testcounter =0; 

module.exports = function (socket, channelname){
	var module = {}; 
	/*Client Tab house*/
	module.ClientTab = []; 

	module.channel = postal.channel(channelname); 
	module.isReady = false; 
	//forward outgoing packets

	module.channel.subscribe("outgoing", function (data) {
		console.log("consumed from channel"); 
		forwardToSocket(data,socket, data.reciever);  
    });
		
	/*subsrictions should be in manager, reducer, client code with appropriate handlers */ 
    module.channel.subscribe("incoming", function (data) {
    	var sender = data.sender; 
    	var reciever = data.reciever; 
    	var topic = data.topic; 
    	var id =  data.id;
    	data = data.data;
    	
    	module.channel.publish(topic, data); 
    }); 

    module.publishToSelectedWorkers = function (recipient, topic,data) {
		
		data = wrapData(channelname, "worker" ,topic, recipient, data); 
		module.channel.publish( "outgoing", data);
	}

	module.publishToStatusWorkers = function (status, topic, data) {
		if (status!='idle' && status!='active') {
			console.log("Incompatible Status. Options: idle, active");
		}
		var recip = []; 
		for (var i=0; i<module.clientTab.length; i++) {
			if(module.clientTab.status==status) {
				recip.push(module.clientTab.sockid); 
			}
		}
		data = wrapData(channelname, "worker", topic, recip, data); 
		module.channel.publish( "outgoing", data); 
	}
	module.publishToReducer = function (topic, data) {
		data = wrapData(channelname, "reducer", topic, null, data); 
		console.log("publising to channel"); 
		module.channel.publish('outgoing', data);
	} 
	module.publishToManager = function (topic, data) {
		data = wrapData(channelname, "manager", topic, null, data);  
		module.channel.publish('outgoing', data); 
	} 

	module.getIdleWorkers = function () {
		var idle = []; 
		for (var i=0; i < module.ClientTab.length; i++) {
			if(module.ClientTab[i].status == "idle" && module.ClientTab[i].role =="worker") 
				idle.push(module.ClientTab[i].sockid); 
		}
		return idle; 
	} 
	module.printConnections = function () {
		console.log("Inflection Server connected to ...")
		for (var i=0; i<module.ClientTab.length; i++) {
			console.log(module.ClientTab[x].role +" at sockId " + module.ClientTab.sockid); 
		}
	}
	
	/*recieve incoming messages*/ 
	socket.on(channelname, function(msg){	
		console.log("incoming messages"); 	
		module.channel.publish("incoming", msg); 
	}); 

	/*register self*/
	var msg= {}; 
	msg = wrapData(channelname, "", "", "", msg); 
	socket.emit('register', msg); 
		 
	/*recieve update client tab from socketserver 
	ISSUE: error checking is dog shit
	*/ 
	socket.on('clientTabUpdate' , function(msg) {
		module.ClientTab = msg; 
		console.log("recieved clientTab"); 
		if(!module.isReady) {
			module.isReady=true; 
			//module.activateOutgoingTraffic(); 
		}
	}); 

	return module;
};

function forwardToSocket(data, socket, type) {
	socket.emit(type, data); 
}

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
*
*/

