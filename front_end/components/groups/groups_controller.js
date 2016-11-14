app.controller('groupsController', ['$location', '$route', '$scope', function($location,$route,$scope) {
    $scope.groups = [
    {
    	"gName": "Xinu",
    	"gNumUsers": "2",
    	"gNumJobs": "50"
    }, {
    	"gName": "7>5 Layer Model",
    	"gNumUsers": "7",
    	"gNumJobs": "777"
    }]
}]);

/*
app.controller('groupsController', ['$scope', function($scope) {
  $scope.double = function(value) { return value * 2; };
}]);
*/