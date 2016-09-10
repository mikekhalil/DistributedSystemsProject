// require stuff
var express = require('express');




//initalize stuff
var app = express();

app.get('/', function (req, res) {
    res.send('<h1> Hello World </h1> ');
});


app.listen(3000, function() { 
    console.log('listening on port 3000');
});