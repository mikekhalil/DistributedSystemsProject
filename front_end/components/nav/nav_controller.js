app.controller('navController', ['User','$rootScope','$scope','$localStorage','$http','$location',  function(User,$rootScope,$scope,$localStorage,$http,$location){

        
        if (false){
             //TO DO  -> root scope user data
             var user = new User($localStorage.currentUser.token);
        }
             
        else
            $scope.name = "Welcome";

    $scope.logout =   function () {
            // remove user from local storage and clear http auth header
            delete $localStorage.currentUser;
            $rootScope._user = null;
            if ($http.defaults) {
                $http.defaults.headers.common.Authorization = '';
            }
            $location.path('/');
            console.log('logged out');
            if(th){
                th.socket.disconnect();
                th = null;
            }
    }
    $scope.isActive = function(path) {

        if (path == $location.$$path) return true;
        return false;
    }

}]);