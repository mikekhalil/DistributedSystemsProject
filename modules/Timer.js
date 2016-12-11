/*Timer.js*/ 

var fs = require("fs"); 
var buff = {}; 
var FILENAME = 'times.txt'; 

fs.open(FILENAME, 'w', function(err, fd) {
   		if (err) {
      		return console.error(err);
   		}
  		
});

var log = function(msg) {
	

	//take message and log 
	var data = msg.data; 

	if (data.event == "jobEnd") {
		writeJobToFile(data.id, data.timestamp); 		
	}
	else {
		buff[[data.event, data.id]] = data.timestamp; 	
	}

}

function writeJobToFile(id, endTime) {
	var startTime = parseInt(buff[['jobStart' , id]]);
	var elapsed = parseInt(endTime) - startTime; 

	var string  = "Job " + id + " took " + elapsed + " ms.\n"
	console.log(string); 
	fs.appendFile(FILENAME, string, function (err) {
		if (err) 
			console.log(err); 
	
	}); 
	//write "Job #id took elapsed ms" 
}

module.exports = {
	LOG : log
}

