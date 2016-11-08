var mapper = null;
var reducer = null;
messenger.inchannel.subscribe("MapReduce", function(packet) {
    console.log('map reduce ayy');
    mapper = new Function('key', 'value',packet.data.mapper);
    reducer = new Function('key','value',packet.data.reducer);
});

messenger.inchannel.subscribe("InputSplit", function(packet) {
    console.log('InputSplit');
    console.log(packet);
    var input = packet.data.fileData;
    var records = RecordReader(input, {type: "TextInputFormat"});
    var ShuffledData = Mapper( mapper, records );
    var ReducedData = Reducer( ShuffledData, reducer, null );
    console.log(socket.io.engine.id);
    console.log('reduced data ');
    console.log(ReducedData);
   
    messenger.publishTo('reducer','Results', ReducedData);
    messenger.publishTo('manager', 'Results', {completed : true, sockid : socket.io.engine.id, inputSplit : packet.data.inputSplit});
});

