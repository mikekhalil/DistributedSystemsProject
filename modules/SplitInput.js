/* Splits the file into 64 mb chunks.
 * Returns an array containing the file paths of each chunk.
 * Written by Paul Heldring
 */
const path = require('path');

function writeSplit(split, filepath) {
    var fs = require('fs');
    fs.writeFile(filepath, split, function(err) {
        if (err) {
            return console.log(err);
        }
    });
}

function makeDirs(groupDir, jobDir, splitDir) {
    var fs = require('fs');
    if (!fs.existsSync(groupDir)) {
        fs.mkdirSync(groupDir);
    }
    if (!fs.existsSync(groupDir + "/" + jobDir)) {
        fs.mkdirSync(groupDir + "/" + jobDir);
    }
    if (!fs.existsSync(groupDir + "/" + jobDir + "/" + splitDir)) {
        fs.mkdirSync(groupDir + "/" + jobDir + "/" + splitDir);
    }
}

// splits file and saves the splits in to groupDir/jobDir/splits
// ex. groupA/job0/splits/0.txt
var func = function SplitInput(file, groupDir, jobDir, callback) {
    var fs = require('fs');
    var util = require('util');
    var stream = require('stream');
    var es = require('event-stream');
    var split = '';         /* split string			     */
    var splits = {};        /* store file path of splits */
    var splitCount = 0;     /* number of splits			 */
    var filepath = '';      /* full path of split		 */
    const splitSize = 16000; /* split size in bytes		 */
    const splitDir = groupDir + "/" + jobDir + "/" + "splits";

    makeDirs(groupDir, jobDir, "splits");

    var s = fs.createReadStream(file)
        .pipe(es.split())
        .pipe(es.mapSync(function(line) {
                s.pause();
                split += line + "\n";
                if (split.length >= splitSize) {
                    filepath = path.join(splitDir, splitCount + '.txt');
                    writeSplit(split, filepath);
                    splits[splitCount++] = filepath;
                    split = '';
                }
                s.resume();
            })

            .on('error', function() {
                console.log('Error while reading file.');
            })
            .on('end', function() {
                // write last input split to file
                if (split.length > 0) {
                    filepath = path.join(splitDir, splitCount + '.txt');
                    writeSplit(split, filepath);
                    splits[splitCount] = filepath;
                }
                callback(splits);
            })
        );
}


module.exports = {
    splitInput: func
}