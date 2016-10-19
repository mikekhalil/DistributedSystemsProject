var socket = io();
var channelname = 'worker'; 
var messenger = {}; 
messenger.inchannel = postal.channel(); 
messenger.outchannel = postal.channel(); 
messenger.ClientTab = []; 

messenger.publishToSelectedWorkers = function (recipient, topic,data) {
		
		data = wrapData(channelname, "worker" ,topic, recipient, data); 
		messenger.outchannel.publish( "outgoing", data);
	}

/*publish to workers with selected status*/
messenger.publishToStatusWorkers = function (status, topic, data) {
	if (status!='idle' && status!='active') {
		console.log("ERROR: Invalid Status. Options: idle, active");
	}
	var recip = []; 
	for (var i in messenger.clientTab) {
		if(messenger.clientTab[i].status==status && messenger.clientTab[i].role =="worker") {
			recip.push(messenger.clientTab[i].sockid); 
		}
	}
	data = wrapData(channelname, "worker", topic, recip, data); 
	messenger.outchannel.publish( "outgoing", data); 
}
/*General publish call. When worker is selected, all connected workers will get msg.*/ 
messenger.publishTo = function (recipient, topic, data) {
	recipient = _.toLower(recipient); 
	var options = ['worker', 'reducer', 'manager', 'server']; 
	var intersect = _.intersection(options, [recipient]);
	if (intersect.length!=1) {
		console.log('ERROR: Invalid recipient'); 
		return; 
	}
	data = wrapData(channelname, recipient, topic, null, data); 
	messenger.outchannel.publish("outgoing", data); 
}

/*print clientTab*/ 
messenger.printConnections = function () {
	console.log("Inflection Server connected to ...")
	for (var i in messenger.ClientTab) {
		console.log(messenger.ClientTab[i].role +" at sockId " + messenger.ClientTab[i].sockid); 
	}
}


/*route outgoing messages to socket.io server*/ 
messenger.outchannel.subscribe("outgoing", function (data) {
	console.log("outgoing  traffic"); 
	socket.emit(data.reciever, data); 
});
		
/*recieve incoming messages and re-establish original topic*/ 
messenger.inchannel.subscribe("incoming", function (data) {
	console.log("incoming traffic"); 
    messenger.inchannel.publish(data.topic, data); 
}); 

/*recieve incoming messages*/ 
socket.on(channelname, function(msg){	
		messenger.inchannel.publish("incoming", msg); 
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
	messenger.ClientTab = msg; 
}); 


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




