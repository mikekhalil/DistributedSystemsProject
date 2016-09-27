// test
var records = [ {"key":"0", "value":"Paul"}, {"key":"1", "value":"Alex"}, {"key":"2", "value":"Paul"}, {"key":"3", "value":"Dave"} ];

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

// WHY CAN'T I FIND A STRCMP FUNC IN JAVASCRIPT??
function strcmp( str1, str2 ) {
    for ( i in str1 ) {
	for ( j in str2 ) {
	    if ( str1[i] > str2[j] )
		return 1;
	    else if ( str1[i] < str2[j] )
		return -1;
	}
    }
    return 0;
}

for (var i in records) {
    // call map function
    pairs =  wordCount( records[i].key, records[i].value );
    for (var j in pairs) {
	var index = indexOfVal(pairs[j].key);
	if ( index == -1 ) {
	    // key doesn't exit, create an array and append value to array
	    var tmp = pairs[j].value;
	    pairs[j].value = new Array();
	    pairs[j].value.push(tmp);
	    shuffledList.push(pairs[j]);
	} else {
	    // key exists, append value to array
	    shuffledList[index].value.push(pairs[j].value);
	}
    }
}
shuffledList.sort(function(a, b) { return strcmp(a.key, b.key);});
console.log(shuffledList);
