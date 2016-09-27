
// test
var records = [ {"key":"0", "value":"Paul"}, {"key":"1", "value":"Monte"}, {"key":"2", "value":"Paul"} ];

function wordCount( key, value ) {
    var list = new Array();
    var count = 1;
    list.push({key : value, value : count});
    return list;
}

var shuffledList = new Array();
var pairs = {};

// might have to do binary search
function indexOfVal( str ) {
    for (var i in shuffledList) {
	if (shuffledList[i].key === str) {
	    return i;
	}
    }
    return -1;
}

for (var i in records) {
    // call map function
    pairs =  wordCount( records[i].key, records[i].value );
    for (var j in pairs) {
	var index = indexOfVal(pairs[j].key);
	if ( index == -1 ) {
	    // key doesn't exit
	    var tmp = pairs[j].value;
	    pairs[j].value = new Array();
	    pairs[j].value.push(tmp);
	    shuffledList.push(pairs[j]);
	} else {
	    shuffledList[index].value.push(pairs[j].value);
	}
    }
}
console.log(shuffledList);
