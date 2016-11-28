app.controller('profileController', ['$http', '$location', '$route', '$scope','$rootScope','$localStorage', function($http, $location,$$route,$scope,$rootScope,$localStorage) {

var token =  $localStorage.currentUser.token;

$scope.cur = null;

$scope.getUser = function(){
    $http({
        url: '/api/user',
        method: "GET",
        headers: {'x-access-token' : token }
    }).then(function(rsp) {
        $scope.cur = rsp.data;
    },function(rsp) {
        console.log('fail');
        console.log(rsp);
    });
}

$scope.getUser();

}]);