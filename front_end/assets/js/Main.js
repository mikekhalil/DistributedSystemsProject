
class TaskHandler {
    constructor(user) {
        this.user = user;
        this.mapper = null;
        this.reducer = null;
        this.socket = io();
        console.log('creating message queue');
        this.mq = new MessageQueue(this.socket, this.user);
        this.mq.start();
    }
    start() {
        var that = this;
         that.mq.messenger.inchannel.subscribe("MapReduce", function(packet) {
            console.log('Job started');
            that.mapper = new Function('key', 'value',packet.data.mapper);
            that.reducer = new Function('key','value',packet.data.reducer);
        });

        that.mq.messenger.inchannel.subscribe("InputSplit", function(packet) {
            console.log('InputSplit');
            //console.log(packet);
            var input = packet.data.fileData;
            var records = RecordReader(input, {type: "TextInputFormat"});
            var ShuffledData = Mapper( that.mapper, records );
            var ReducedData = Reducer( ShuffledData, that.reducer, null );
            //console.log(socket.io.engine.id);
            console.log('reduced data ');
            console.log(ReducedData);
    
            that.mq.messenger.publishTo('reducer','Results', ReducedData);
            that.mq.messenger.publishTo('manager', 'Results', {completed : true, sockid : that.socket.io.engine.id, inputSplit : packet.data.inputSplit});
        });
        

    }
 
}


