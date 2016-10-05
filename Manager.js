var socket = require('socket.io-client')('http://localhost:8080'); 
var messenger = require(__dirname + '/modules/messenger.js')(socket, "manager");
var fs = require('fs');
var config = require('./config.json');
var splitter = require(__dirname + '/modules/SplitInput.js');
const path = require('path');

//resource table with have rows of Resource Objects
//Resource Object : { inputSplit (string) , processed (boolean), worker (socketid), active (boolean)}
var ResourceTable = [];
var setup = {map : null, reduce : null, data : null }

//check to see if the system is fully initialized
var isInitialized = function() {
    if(setup.map && setup.reduce && setup.data)
        return true;
    
    return false;
}

socket.on('UploadedFiles', function(file) {
    if( file.type === config.REDUCE || file.type === config.MAP ){
        setup[file.type] = new Function(file.data);
    }
    else {
        //Data file, Create Input Splits
        setup[file.type] = file.data;

        console.log(file.data);

        var dir = path.join(__dirname,config.multer.path,'splits');

        //create directory for splits 
        var inputSplits = splitter.splitInput(file.data,dir);
        console.log(inputSplits);
    }

    if(isInitialized()) {
        //let everyone know that we are good to go 
        console.log(setup);
    }
});