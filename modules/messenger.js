/*
*Messenger.js - postal.js channel endpoint for socket.io inflection server
*Author: Sameet Mohanty
*/

var postal = require("postal");
var _  = require("lodash"); 

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
	/*Client Tab house*/
	module.ClientTab = []; 

	module.inchannel = postal.channel("in" + channelname); 
	module.outchannel  = postal.channel("out" + channelname); 



	module.outchannel.subscribe("outgoing", function (data) {
		forwardToSocket(data,socket, data.reciever);  
    });
		
    module.inchannel.subscribe("incoming", function (data) {
    	module.inchannel.publish(topic, data); 
    }); 

    module.publishToSelectedWorkers = function (recipient, topic,data) {
		
		data = wrapData(channelname, "worker" ,topic, recipient, data); 
		module.outchannel.publish( "outgoing", data);
	}
	module.publishToStatusWorkers = function (status, topic, data) {
		if (status!='idle' && status!='active') {
			console.log("Incompatible Status. Options: idle, active");
		}
		var recip = []; 
		for (var i in module.clientTab) {
			if(module.clientTab[i].status==status && module.clientTab.role =="worker") {
				recip.push(module.clientTab.sockid); 
			}
		}
		data = wrapData(channelname, "worker", topic, recip, data); 
		module.outchannel.publish( "outgoing", data); 
	}
	module.publishTo = function (recipient, topic, data) {
		recipient = _.toLower(recipient); 
		var options = ['worker', 'reducer', 'manager', 'server']; 
		var intersect = _.intersection(options, [recipient]);
		if (intersect.length!=1) {
			console.log('ERROR: invalid recipient'); 
			return; 
		}
		data = wrapData(channelname, recipient, topic, null, data); 
	}
	module.printConnections = function () {
		console.log("Inflection Server connected to ...")
		for (var i in module.ClientTab) {
			console.log(module.ClientTab[i].role +" at sockId " + module.ClientTab[i].sockid); 
		}
	}
	
	/*recieve incoming messages*/ 
	socket.on(channelname, function(msg){	
		console.log("incoming messages"); 	
		module.inchannel.publish("incoming", msg); 
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

