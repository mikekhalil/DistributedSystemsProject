// read a file

var fs = require('fs');
var file = 'test';
var encoding = 'utf8'; 

var j = 0;

var split = [];

// array of splits
var splits = {};
var splitSize = 5;
var splitCount = 0;


fs.readFile( file, encoding, function (err, data) {
    if (err) {
	return console.log(err);
    }
    for (var i = 0; i < data.length; i++) {
	if ( j == (splitSize-1) || i == (data.length-1) ) {
	    // go to end of record
	    while ( data[i] != '\n' ) {
		split[j++] = data[i++];
	    }
	    split[j] = data[i];
	    console.log(split);
	    j = 0;
	    split = [];
	}
	else {
	    split[j++] = data[i];	
	}
    }
});


// write a file

//var fs = require('fs');
//fs.writeFile("test", "Hey there!", function(err) {
 //   if(err) {
  //      return console.log(err);
   // }

    //console.log("The file was saved!");
//}); 
