app.controller('navController', ['TaskHandler','User','$rootScope','$scope','$localStorage','$http','$location',  function(TaskHandler,User,$rootScope,$scope,$localStorage,$http,$location){
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