app.controller('dashboardController', ['$location', '$route', '$scope','$rootScope','User','$localStorage','$http', function($location,$route,$scope, $rootScope, User,$localStorage,$http) {
    $scope.group = "Purdue";

    var user = new User($localStorage.currentUser.token);
    $scope.my_groups = [];
    $scope.completed_jobs = [];
    user.getData((err,rsp) => {
        $scope.my_groups = rsp.groups;
        console.log($scope.my_groups);
    });
    $scope.selected = (group) => {
        console.log('selected '+ group);
    }

    $scope.$on('ReducerComplete', (event, data) => {
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

}]);