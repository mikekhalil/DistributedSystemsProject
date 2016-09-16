var Express = require('express');
var messenger = require(__dirname + '/modules/channels.js');
var upload = require(__dirname + '/modules/MulterConfig.js');

//initalize stuff

var app = Express();


app.get('/', function (req, res) {
    res.send('<h1> Hello World </h1> ');
});



app.listen(3000, function() { 
    console.log('listening on port 3000');
}); 