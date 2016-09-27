
// test
var records = [ {"key":"0", "value":"Paul"}, {"key":"1", "value":"Monte"}, {"key":"2", "value":"Paul"} ];

function wordCount( key, value ) {
    var list = new Array();
    var count = 1;
    list.push({key : value, value : count});
    return list;
}

var pairs = {};

for (var i in records) {
    var key = records[i].key;
    var val = records[i].value; 
    //console.log(key);
    //console.log(val);

    pairs = wordCount( key, val );

    console.log(pairs);
}
