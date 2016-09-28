function Reducer(ShuffledData, reduceFunc, Config) {
    var result = {};
    for(var index in ShuffledData) {
        var record = ShuffledData[index];
        var reduction = reduceFunc(record.key, record.value);
        result[record.key] = reduction;
    }
}

//example output from shuffler 
var input = [
    { key : "Paul" , value: [1,1,1] },
    { key : "Mikey", value: [1] },
    { key : "cool", value: [1] }
];


function reduceFunc(key, val) {
    //word count example
    var count = 0;

    for(var index in val) {
        console.log('val[[index]] = ' + val[index]);
        count += val[index];
    }
    console.log('count ' + count);
    return count;
}


Reducer(input, reduceFunc, null);






