app.controller('uploadController', ['$scope','Upload','$timeout','$location','$localStorage', '$http', function($scope,Upload,$timeout,$location,$localStorage, $http) {
    $scope.cream = "This is the value of cream";
    $scope.isActive = function(route) {
        console.log('activity changed');
        return $location.path().includes(route);
    }
    $scope.dataLog = '';
    $scope.mapLog = '';
    $scope.reduceLog = '';
    $scope.myGroups = [];

    $scope.allFiles = {};
    
    var token = $localStorage.currentUser.token
    
    $scope.$watch('dataFile', function () {
        if ($scope.dataFile != null) {
            $scope.allFiles["dataFile"] = [$scope.dataFile];
        }
    });

    $scope.$watch('mapFile', function() {
        if ($scope.mapFile != null) {
            $scope.allFiles["mapFile"] = [$scope.mapFile];
        }
    });

    $scope.$watch('reduceFile', function() {
        if ($scope.reduceFile != null) {
            $scope.allFiles["reduceFile"] = [$scope.reduceFile];
        }
    });
   
    //TODO CREATE progress bar?
    $scope.upload = function (files, log, type,group_id,job_id) {
        if (files && files.length) {
            for (var i = 0; i < files.length; i++) {
              var file = files[i];
              if (!file.$error) {
                Upload.upload({
                    url: 'http://localhost:8080/api/InputFiles/',
                    data: {
                      file: file,
                      type : type,
                      group: group_id,
                      job : job_id
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

    // are all the jobs properly initialized?
    jobsInit = function(files) {
        var len = Object.keys(files).length;
        if ( len != 3 ) {
            console.log("only " + len + " files submitted!");
            return false;
        }
        return true;
    }

    $scope.startJob = function() {
        if ($scope.selectedGroup != null && jobsInit($scope.allFiles)) {
            var id = Date.now().toString();
            console.log("Starting job in " + $scope.selectedGroup);
            registerJob(id,$scope.selectedGroup, $scope.user.email);
        }
    }


    var registerJob = function(job_id,group_id, user_id)  {
        //generate job id for now :: TODO: get string input
        $http({
            url: '/api/registerJob',
            method: 'POST',
            data: {id: job_id, group: $scope.selectedGroup},
            headers: {'x-access-token': token }
        }).then(function(rsp) {
            console.log(rsp.data);
            console.log('uploading files');
            $scope.upload($scope.allFiles["dataFile"],'dataLog', "data",$scope.selectedGroup, job_id);
            $scope.upload($scope.allFiles["mapFile"],'mapLog',"map",$scope.selectedGroup,job_id);
            $scope.upload($scope.allFiles["reduceFile"],'reduceLog',"reduce",$scope.selectedGroup,job_id);
        },function(rsp) {  
            console.log('err');
            console.log(rsp.data);
        });
    }

    $scope.getUser = function(){
        $http({
            url: '/api/user',
            method: "GET",
            headers: {'x-access-token' : token }
        }).then(function(rsp) {
            console.log(rsp.data);
            $scope.user = rsp.data;
            $scope.myGroups = rsp.data.groups;

        },function(rsp) {
            console.log(rsp);
        });
    }

    $scope.getUser();


   
}]);