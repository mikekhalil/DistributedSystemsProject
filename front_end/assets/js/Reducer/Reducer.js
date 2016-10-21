function Reducer(ShuffledData, reduceFunc, Config) {
    var result = {};
    for(var index in ShuffledData) {
        var record = ShuffledData[index];
        var reduction = reduceFunc(record.key, record.value);
        result[record.key] = reduction;
    }
    return result;
}





