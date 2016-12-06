
class TaskHandler {
    constructor(user) {
        this.user = user;
        this.mapper = {};
        this.reducer = {};
        this.socket = io();
        console.log('creating message queue');
        this.mq = new MessageQueue(this.socket, this.user);
        this.mq.start();
    }
    start() {
        var that = this;
         that.mq.messenger.inchannel.subscribe("MapReduce", function(packet) {
            console.log('Job started');
            console.log(packet);
            that.mapper[packet.data.group_id] = new Function('key', 'value', packet.data.mapper);
            that.reducer[packet.data.group_id] = new Function('key', 'value', packet.data.reducer);
        });

        that.mq.messenger.inchannel.subscribe("InputSplit", function(packet) {
            console.log('InputSplit');
            console.log(packet);
          
            var input = packet.data.fileData;
            var group_id = packet.data.group_id;
            var records = RecordReader(input, {type: "TextInputFormat"});
            var ShuffledData = Mapper( that.mapper[group_id], records );
            var ReducedData = Reducer( ShuffledData, that.reducer[group_id], null );

            
            //that.mq.messenger.publishTo('reducer','Results', ReducedData);
            that.mq.messenger.publishTo('manager', 'Results', {completed : true, sockid : that.socket.io.engine.id, inputSplit : packet.data.inputSplit, group_id : packet.data.group_id});
        });
        

    }
 
}


