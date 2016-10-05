var socket = require('socket.io-client')('http://localhost:8080'); 
var messenger = require(__dirname + '/modules/messenger.js')(socket, "manager");
var fs = require('fs');

const REDUCE = 'reduce';
const MAP = 'map';
const DATA = 'data';

var setup = {map : null, reduce : null, data : null }

socket.on('initialize', function(file) {
    if( file.type === REDUCE || file.type === MAP ){
        setup[file.type] = new Function(file.data);
    }
    else {
        //data
        setup[file.type] = file.data;
    }
    
    console.log(setup);
});