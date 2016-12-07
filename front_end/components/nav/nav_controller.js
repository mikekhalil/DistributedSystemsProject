app.controller('navController', ['TaskHandler','User','$rootScope','$scope','$localStorage','$http','$location',  function(TaskHandler,User,$rootScope,$scope,$localStorage,$http,$location){

  
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