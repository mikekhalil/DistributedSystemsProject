/* Splits the file into 64 mb chunks.
 * Returns an array containing the file paths of each chunk.
 * Written by Paul Heldring
 */

var func = function SplitInput( file ) {

    var fs = require('fs'); 
    var splitDir = '/splits/';	/* dir where splits are stored. */
    var encoding = 'utf8';	/* character encoding		*/
    var j = 0;			/* count num chars in split	*/
    var split = '';		/* split string			*/
    var splits = {};		/* store file path of splits	*/
    var splitSize = 64000000;  	/* split size in bytes		*/
    var splitCount = 0;		/* number of splits		*/
    var filepath = '';		/* full path of split		*/

    if (!fs.existsSync(__dirname + splitDir)) {
		fs.mkdirSync(__dirname + splitDir);
    }

    fs.readFile( file, encoding, function (err, data) {
	if (err) {
	    return console.log(err);
	}
	
	for (var i = 0; i < data.length; i++) {
	    // Reached max split size or end of file 
	    if ( j == (splitSize-1) || i == (data.length-1) ) {
		while ( data[i] != '\n' ) {
		    split += data[i++];
		    j++;
		}
		split += data[i];
		filepath = __dirname + splitDir + splitCount + '.txt';
		// Write split to split directory
		fs.writeFile(filepath, split, encoding, function(err) {
		    if (err) {
			return console.log(err);
		    }
		});
		splits[splitCount++] = filepath;
		split = '';
		j = 0;
	    }
	    // Append characters to the split
	    else {
		split += data[i];	
		j++;
	    }
	}
    });
    
    return splits;
}

module.exports = {
	splitInput : func
}