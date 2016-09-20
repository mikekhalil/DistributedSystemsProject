// require stuff
var messenger = require(__dirname + '/modules/channels.js');
var InputReader = require(__dirname + '/modules/SplitInput.js');

/* example usage : 
    var splits = InputReader.splitInput('/path/to/file');
    //splits = array of ~64mb files from input file
*/
