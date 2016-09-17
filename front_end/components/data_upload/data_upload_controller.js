app.controller('uploadController', ['$scope','$http', function($scope, $http) {
    $scope.cream = "This is the value of cream";
    $scope.uploadFile = function(){
        var file = $scope.myFile;
        var uploadUrl = "/InputFiles";
        var fd = new FormData();
        fd.append('file', file);

        $http.post(uploadUrl,fd, {
            transformRequest: angular.identity,
            headers: {'Content-Type': undefined}
        })
        .error(function(){
            console.log("error!!");
        }); 
    }
}]);