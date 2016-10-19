var mapper = null;
var reducer = null;
messenger.inchannel.subscribe("MapReduce", function(packet) {
    console.log('map reduce ayy');
    mapper = new Function('key', 'value',packet.data.mapper);
    reducer = new Function('key','value',packet.data.reducer);
});

messenger.inchannel.subscribe("InputSplit", function(packet) {
    console.log('InputSplit');
    var input = packet.data;
    var records = RecordReader(input, {type: "TextInputFormat"});
    var ShuffledData = Mapper( mapper, records );
    var ReducedData = Reducer( ShuffledData, reducer, null );
    console.log('reduced data ');
    console.log(ReducedData);
});

