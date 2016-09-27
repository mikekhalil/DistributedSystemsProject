function RecordReader(InputSplit, Config) {
    //determine type of input
    var type = Config.type;
    
    //initalize records to null for error detection
    var records = [];

    if(type == "TextInputFormat"){
        //key is line number, val is line
        arr = InputSplit.split("\n");
        console.log(arr.length);
        for(var i = 0; i < arr.length; i++) {
            //check to see if split ended on a new line
            if(arr[i].length > 0)
                records.push({key : i, value : arr[i]});
        }
    }
    else if(type == "KeyValueTextInputFormat") {
        //keys and vals are specified in file
        var delimitter = Config.delimitter;
        var keysAndVals = InputSplit.split("\n");
        console.log(keysAndVals);
        for(var row in keysAndVals) {
            if(keysAndVals[row].length > 0){
                var r = keysAndVals[row].split(delimitter);
                var key = r[0];
                var val = r[1];
                records.push({key : key, value : val});
            }
        }
    }
    else if(type == "SequenceFileInputFormat") {
        //TODO: Implement Sequene File Input Format
    }
    else if(type == "SequenceFileAsTextInputFormat") {
        //TODO: Implement 
    }
    
    return records     
}
