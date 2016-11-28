app.controller('navController', ['UserService','$rootScope','$scope','$localStorage','$http','$location',  function(User,$rootScope,$scope,$localStorage,$http,$location){
    
  
        if ($localStorage.currentUser)
            $scope.name = $localStorage.currentUser.username;
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
    }
    $scope.isActive = function(path) {

        if (path == $location.$$path) return true;
        return false;
    }

}]);