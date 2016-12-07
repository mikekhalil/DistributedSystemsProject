app.service('TaskHandler', function($rootScope) {
        this.init = function($rootScope) {
            this.rootScope = $rootScope;
            this.user = $rootScope._user;
            this.mapper = {};
            this.reducer = {};
            this.nodeCount = {};    //job_id -> job count
            this.totalCount = {};   //progress for a job
            this.jobLength = {};    //length for a job
            this.socket = io();
            this.mq = new MessageQueue(this.socket, this.user);
            this.mq.start();
        }
        this.start = function() {
            var that = this;
            that.mq.messenger.inchannel.subscribe("MapReduce", function(packet) {
                console.log('Job started for group : ' + packet.data.group_id);
                console.log(packet);
                that.mapper[packet.data.group_id] = new Function('key', 'value', packet.data.mapper);
                that.reducer[packet.data.group_id] = new Function('key', 'value', packet.data.reducer);

                //TODO: Set that.jobLength[group_id] - implement serverside functionality
                that.nodeCount[packet.data.group_id] = 0;
            });

            that.mq.messenger.inchannel.subscribe("InputSplit", function(packet) {
                console.log('InputSplit Received for Group : ' + packet.data.group_id);
                that.nodeCount[packet.data.group_id] += 1;
                that.rootScope.$broadcast('InputSplitUpdate', that.nodeCount);
                
                var input = packet.data.fileData;
                var group_id = packet.data.group_id;
                var records = RecordReader(input, {type: "TextInputFormat"});
                var ShuffledData = Mapper( that.mapper[group_id], records );
                var ReducedData = Reducer( ShuffledData, that.reducer[group_id], null );
                var reducerPacket = {data : ReducedData};
                var managerPacket = {completed : true, sockid : that.socket.io.engine.id, inputSplit : packet.data.task, group_id : packet.data.group_id}
                console.log(reducerPacket);
                
                //that.mq.messenger.publishTo('reducer','Results', ReducedData);
                that.mq.messenger.publishTo('manager', 'Results', managerPacket);
            });
        

        }
});



