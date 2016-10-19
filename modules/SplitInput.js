/* Splits the file into 64 mb chunks.
 * Returns an array containing the file paths of each chunk.
 * Written by Paul Heldring
 */
const path = require('path');

var func = function SplitInput( file , splitDir) {

    var fs = require('fs'); 
    var encoding = 'utf8';	/* character encoding		*/
    var j = 0;			/* count num chars in split	*/
    var split = '';		/* split string			*/
    var splits = {};		/* store file path of splits	*/
    var splitSize = 500;  	/* split size in bytes		*/
    var splitCount = 0;		/* number of splits		*/
    var filepath = '';		/* full path of split		*/

    if (!fs.existsSync(splitDir)) {
		fs.mkdirSync(splitDir);
    }

	console.log(file);

    var data = fs.readFileSync( file, encoding);
	
	for (var i = 0; i < data.length; i++) {
	    // Reached max split size or end of file 
	    if ( j == (splitSize-1) || i == (data.length-1) ) {
		while ( data[i] != '\n' && i < data.length) {
		    split += data[i++];
		    j++;
		}
			split += data[i];
			filepath = path.join(splitDir, splitCount + '.txt');
			
			// Write split to split directory
			fs.writeFileSync(filepath, split, encoding);
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
    
    return splits;
}

module.exports = {
	splitInput : func
}