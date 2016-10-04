var socket = io();
var DefaultChannel = postal.channel(); 
var TaskChannel = postal.channel("TaskChannel");
var ResourceChannel = postal.channel("ResourceChannel"); 
var ReduceChannel =  postal.channel("ReduceChannel");  


TaskChannel.subscribe( "#", function ( data ) {
    console.log("data in channel " + data); 
});

socket.on('relay', function(msg){
 
	var channel = msg.channel; 
	var topic = msg.topic;

	if (channel == "Manager")
		TaskChannel.publish(topic, msg.data);
	else if (channel == "ResourceChannel")
		ResourceChannel.publish(topic, msg.data);  
	else if (channel == "ReduceChannel")
		ReduceChannel.publish(topic, msg.data); 
	else 
		DefaultChannel.publish(topic,msg.data); 
}); 

function RegisterWithSocket() { 
	var msg = {}; 
	msg.level = "worker"; 
	socket.emit('register', msg); 
}

RegisterWithSocket(); 




