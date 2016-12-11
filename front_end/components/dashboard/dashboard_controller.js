app.controller('dashboardController', ['$location', '$route', '$scope','$rootScope','User','$localStorage','$http','$interval', function($location,$route,$scope, $rootScope, User,$localStorage,$http,$interval) {

    $scope.group = "Purdue";

    var user = new User($localStorage.currentUser.token);
    $scope.my_groups = [];
    $scope.completed_jobs = [];

    $scope.clock = 0;
    
    user.getData((err,rsp) => {
        $scope.my_groups = rsp.groups;
        console.log($scope.my_groups);
    });

    $scope.selected = (group) => {
        console.log('selected '+ group);
        console.log("ROOT SCOPE STUFF");
        console.log($rootScope._counters[group]);
    }

    $scope.$on('ReducerComplete', (event, data) => {
        $interval.cancel($rootScope._timer);

        console.log('REDUCER COMPLETE');
        if($scope.group == data.group_id)
            $scope.getCompletedJobs();
    });

   
    $scope.getCompletedJobs = function() {
        $http({
            url : "/api/completedJobs",
            method : "GET",
            params : {group : $scope.group},
            headers: {'x-access-token' : $localStorage.currentUser.token }
        }).then((rsp) => {
            console.log('success');
            //console.log(rsp);
            $scope.completed_jobs = rsp.data.completedJobs;
            console.log($scope.completed_jobs);
        }, (err)=> {
            console.log('error');
            console.log(err);
        });
    }
    $scope.getCompletedJobs();

    $scope.groupCluster = [1,2,3,4,5,6,7,8,9,10,11,12]; 
    $scope.individualNode = [3,3,3,3,3,3,3,3,3,3,3,3];

    // categories will just be seconds
    var categ = [12,11,10,9,8,7,6,5,4,3,2,1];

     Highcharts.chart('container', {
        title: {
            text: '',
            x: -20 //center
        },
        subtitle: {
            text: '',
            x: -20
        },
        xAxis: {
            categories: categ
        },
        yAxis: {
            title: {
                text: 'Tasks Computed per Second (16kb task)'
            },
            plotLines: [{
                value: 0,
                width: 1,
                color: '#808080'
            }]
        },
        tooltip: {
            valueSuffix: ' tasks/sec'
        },
        legend: {
            layout: 'vertical',
            align: 'right',
            verticalAlign: 'middle',
            borderWidth: 0
        },
        series: [{
            name: 'Group Cluster',
            data: $scope.groupCluster
        }, {
            name: 'Individual Node',
            data: $scope.individualNode
        }]
    });

}]);