app.controller('navController', ['TaskHandler','User','$rootScope','$scope','$localStorage','$http','$location', '$interval', function(TaskHandler,User,$rootScope,$scope,$localStorage,$http,$location, $interval){
    $rootScope._clock = null;

    $scope.getDifference = function(startTime){
      
    }
    
    
    $scope.$on('DashboardUpdate', (event,data) =>{
        $scope.$apply(()=> {
            console.log('broadcast\n\n\n\n AYY');
            console.log(data);
            $rootScope._dashboardData = data;
        });
       
    });
     $scope.$on('Counters', (event,data) =>{
        $scope.$apply(()=> {
            console.log('Counters\n\n\n\n AYY');
            console.log(data);
            $rootScope._counters = data;
        });
    });

    $scope.$on('ReducerUpdate', (event, data) => {
        $scope.$apply(() =>{
            console.log('Reducer Update');
            console.log(data);
            $rootScope._reducerData = data;
        });
    });

   


    $scope.$on('ClockStart', (event, data) => {
       console.log('Clock Start');
        console.log(data);
        console.log(data["Purdue"]);
        var startTime = data["Purdue"];
        // $interval($scope.getDifference(startTime), 1000);
        //$interval((startTime) => {
            $scope.$apply(() => {
                console.log("GET DIFF");
                var d = new Date();
                var curTime = d.getTime();
                $rootScope._clock = (curTime - startTime) / 1000;
                console.log($rootScope._clock);
            });

       // }, 1000);
        
    });


  
    $rootScope.$watch('_user', () => {
        if($rootScope._user) {
            TaskHandler.init($rootScope);
            TaskHandler.start();
        }
    });



    $scope.logout =   function () {
            // remove user from local storage and clear http auth header
            delete $localStorage.currentUser;
            $rootScope._user = null;
            if ($http.defaults) {
                $http.defaults.headers.common.Authorization = '';
            }
            $location.path('/');
            console.log('logged out');
            if(TaskHandler.socket) {
                //TaskHandler has been activated - disconnect from socket server
                TaskHandler.socket.disconnect();
            }
    }
    $scope.isActive = function(path) {

        if (path == $location.$$path) return true;
        return false;
    }

}]);