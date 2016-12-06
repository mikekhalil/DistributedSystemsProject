
class MessageQueue {
	constructor(socket, user) {
		this.socket = socket;
		this.messenger = {}
		this.messenger.inchannel = postal.channel(); 
		this.messenger.outchannel = postal.channel(); 
		this.messenger.ClientTab = []; 
		this.user = user;
	}
	start() {
		var that = this;
		var channelname = 'worker'; 
		that.messenger.publishToSelectedWorkers = function (recipient, topic,data) {
				data = wrapData(channelname, "worker" ,topic, recipient, data); 
				that.messenger.outchannel.publish( "outgoing", data);
			}

		/*publish to workers with selected status*/
		that.messenger.publishToStatusWorkers = function (status, topic, data) {
			if (status!='idle' && status!='active') {
				console.log("ERROR: Invalid Status. Options: idle, active");
			}
			var recip = []; 
			for (var i in that.messenger.clientTab) {
				if(that.messenger.clientTab[i].status==status && that.messenger.clientTab[i].role =="worker") {
					recip.push(that.messenger.clientTab[i].sockid); 
				}
			}
			data = wrapData(channelname, "worker", topic, recip, data); 
			that.messenger.outchannel.publish( "outgoing", data); 
		}
		/*General publish call. When worker is selected, all connected workers will get msg.*/ 
		that.messenger.publishTo = function (recipient, topic, data) {
			recipient = _.toLower(recipient); 
			var options = ['worker', 'reducer', 'manager', 'server']; 
			var intersect = _.intersection(options, [recipient]);
			if (intersect.length!=1) {
				console.log('ERROR: Invalid recipient'); 
				return; 
			}
			data = wrapData(channelname, recipient, topic, null, data); 
			that.messenger.outchannel.publish("outgoing", data); 
		}

		/*print clientTab*/ 
		that.messenger.printConnections = function () {
			console.log("Inflection Server connected to ...")
			for (var i in that.messenger.ClientTab) {
				console.log(that.messenger.ClientTab[i].role +" at sockId " + that.messenger.ClientTab[i].sockid); 
			}
		}


		/*route outgoing messages to socket.io server*/ 
		that.messenger.outchannel.subscribe("outgoing", function (data) {
			//console.log("outgoing  traffic"); 
			that.socket.emit(data.reciever, data); 
		});
				
		/*recieve incoming messages and re-establish original topic*/ 
		that.messenger.inchannel.subscribe("incoming", function (data) {
			// console.log("incoming traffic"); 
			that.messenger.inchannel.publish(data.topic, data); 
		}); 

		/*recieve incoming messages*/ 
		that.socket.on(channelname, function(msg){	
				that.messenger.inchannel.publish("incoming", msg); 
		}); 


		/*register self*/
		that.socket.on('connect', function() {
			var msg= {id: that.user.email, groups: that.user.groups}; 
			msg = wrapData(channelname, "", "", "", msg); 
			that.socket.emit('register', msg); 
		}); 
			
		/*recieve update client tab from that.socketserver 
		ISSUE: error checking is dog shit
		*/ 
		that.socket.on('clientTabUpdate' , function(msg) {
			that.messenger.ClientTab = msg; 
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
	}
	disconnect() {
		this.socket.disconnect();
	}
}