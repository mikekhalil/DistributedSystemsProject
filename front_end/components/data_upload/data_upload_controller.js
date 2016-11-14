app.controller('uploadController', ['$scope','Upload','$timeout','$location','$localStorage', function($scope,Upload,$timeout,$location,$localStorage) {
    $scope.cream = "This is the value of cream";
    $scope.isActive = function(route) {
        console.log('activity changed');
        return $location.path().includes(route);
    }
    $scope.dataLog = '';
    $scope.mapLog = '';
    $scope.reduceLog = '';
    
    var token = $localStorage.currentUser.token
    
    $scope.$watch('dataFiles', function () {
        $scope.upload($scope.dataFiles,'dataLog', "data");
    });

    $scope.$watch('dataFile', function () {
        if ($scope.dataFile != null) {
            $scope.dataFiles = [$scope.dataFile]; 
        }
    });

    $scope.$watch('mapFile', function() {
        if ($scope.mapFile != null) {
            $scope.mapFiles = [$scope.mapFile];
        }
    });

     $scope.$watch('mapFiles', function() {
         $scope.upload($scope.mapFiles,'mapLog',"map");
    });

    $scope.$watch('reduceFile', function() {
        if ($scope.reduceFile != null) {
            $scope.reduceFiles = [$scope.reduceFile];
        }
    });

     $scope.$watch('reduceFiles', function() {
         $scope.upload($scope.reduceFiles,'reduceLog',"reduce");
    });
    
    

    $scope.upload = function (files, log, type) {
        if (files && files.length) {
            for (var i = 0; i < files.length; i++) {
              var file = files[i];
              if (!file.$error) {
                Upload.upload({
                    url: 'http://localhost:8080/api/InputFiles/',
                    data: {
                      file: file,
                      type : type 
                    },
                    headers : {'x-access-token' : token }
                }).then(function (resp) {
                    $timeout(function() {
                        $scope[log] = 'file: ' +
                        resp.config.data.file.name +
                        ', Response: ' + JSON.stringify(resp.data) +
                        '\n' + $scope[log];
                    });
                }, null, function (evt) {
                    var progressPercentage = parseInt(100.0 *
                    		evt.loaded / evt.total);
                    $scope[log] = 'progress: ' + progressPercentage + 
                    	'% ' + evt.config.data.file.name + '\n' + 
                      $scope[log];
                });
              }
            }
        }
    };
   
}]);