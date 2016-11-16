/*Tracker.js*/
var fs = require("fs"); 
var buff = []; 
var NUMBEROFNODES = 1; 
var reportedNodes = 0; 

var log = function(msg) {
	

	//take message and log 
	var data = msg.data; 
	if (data == "JobEnd") {
		//calculate flush buffer to file
	}
	else {
		buff.push({
			sender: msg.sender,  
			data: msg.data.data, 
			timestamp: msg.data.timestamp
		});
	}

	
	if(msg.data.data == "Finished") 
		reportedNodes++; 
	if(reportedNodes==NUMBEROFNODES) {
		var time = parseInt(msg.data.timestamp) - parseInt(buff[0].timestamp) 
		console.log("JOB COMPLETED. EXECUTION TOOK: " + time + " ms"); 
	}


	
}

module.exports = {
	LOG : log
}