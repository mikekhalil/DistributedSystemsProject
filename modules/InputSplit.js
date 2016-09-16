//require stuff
var fs = require('fs');

module.exports = {
    createFiles : function(inputFile,outputFile){

    },
    fileSize : (inputFile) => fs.statSync(inputFile)['size']/ 1000000.0,
    
}
