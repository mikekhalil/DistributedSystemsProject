app.service('TaskHandler', function($rootScope) {
        this.init = function($rootScope) {
            this.rootScope = $rootScope;
            this.user = $rootScope._user;
            this.mapper = {};
            this.reducer = {};
            this.nodeCount = {};    //job_id -> job count
            this.totalCount = {};   //progress for a job
            this.jobLength = {};    //length for a job
            this.clock = {};
            this.socket = io();
            this.rootScope._dashboardData = {};
            this.rootScope._counters = {};
            this.rootScope._reducerData = {};
            this.mq = new MessageQueue(this.socket, this.user);
            this.mq.start();
            this.mq.messenger.publishTo('manager', 'DashboardDataRequest', {sock_id : this.socket.io.engine.id});
            this.mq.messenger.publishTo('reducer', 'ReducerRequest', {sock_id : this.socket.io.engine.id});
        }
        this.start = function() {
            var that = this;
            that.mq.messenger.inchannel.subscribe("MapReduce", function(packet) {
                console.log('Job started for group : ' + packet.data.group_id);
                //console.log(packet);
                that.mapper[packet.data.group_id] = new Function('key', 'value', packet.data.mapper);
                that.reducer[packet.data.group_id] = new Function('key', 'value', packet.data.reducer);

                //TODO: Set that.jobLength[group_id] - implement serverside functionality
                var d = new Date();
                that.clock[packet.data.group_id] = d.getTime();
                that.nodeCount[packet.data.group_id] = 0;
                that.totalCount[packet.data.group_id] = 0;
                that.rootScope.$broadcast('ClockStart', that.clock);
            });

            that.mq.messenger.inchannel.subscribe("DashboardData", function(packet) { 
                //getting data for DashboardData
                //console.log(packet.data);
                that.rootScope.$broadcast('DashboardUpdate', packet.data);
                that.rootScope.$broadcast('Counters', {nodeCount : that.nodeCount, totalCount: that.totalCount});
            });

            that.mq.messenger.inchannel.subscribe("ReducerUpdate", function(packet) {
                console.log("REDUCER UPDATE");
                that.rootScope.$broadcast("ReducerUpdate", packet.data);
            });

            that.mq.messenger.inchannel.subscribe("ReducerComplete", function(packet) {
                console.log("REDUCER FINISH");
                that.rootScope.$broadcast("ReducerComplete", packet.data);
            });

            that.mq.messenger.inchannel.subscribe("InputSplit", function(packet) {
               // console.log('InputSplit Received for Group : ' + packet.data.group_id);
                that.nodeCount[packet.data.group_id] += 1;
                that.rootScope.$broadcast('Counters', that.nodeCount);
                
                var input = packet.data.fileData;
                var group_id = packet.data.group_id;
                var records = RecordReader(input, {type: "TextInputFormat"});
                var ShuffledData = Mapper( that.mapper[group_id], records );
                var ReducedData = Reducer( ShuffledData, that.reducer[group_id], null );
                var reducerPacket = {data : ReducedData, group_id : packet.data.group_id, job_id : packet.data.job_id };
                var managerPacket = {completed : true, sockid : that.socket.io.engine.id, inputSplit : packet.data.task, group_id : packet.data.group_id}
                //console.log(reducerPacket);
                
                that.mq.messenger.publishTo('reducer','Results', reducerPacket);
                that.mq.messenger.publishTo('manager', 'Results', managerPacket);
            });
        

        }
});



