app.controller('uploadController', ['$scope','Upload','$timeout','$location','$localStorage', '$http', function($scope,Upload,$timeout,$location,$localStorage, $http) {
  
  
    $scope.log = '';
    $scope.percentage = 0;
    $scope.myGroups = [];

    $scope.allFiles = {};
    
    var token = $localStorage.currentUser.token
    
    $scope.$watch('dataFile', function () {
        if ($scope.dataFile != null) {
            $scope.allFiles['data'] = $scope.dataFile;
        }
    });

    $scope.$watch('mapFile', function() {
        if ($scope.mapFile != null) {
            $scope.allFiles['map'] = $scope.mapFile;
        }
    });

    $scope.$watch('reduceFile', function() {
        if ($scope.reduceFile != null) {
            $scope.allFiles['reduce'] = $scope.reduceFile;
        }
    });
   
    $scope.upload = function (files, group_id, job_id) {
        if (files) {
            // console.log(files);
            Upload.upload({
                url: 'http://localhost:8080/api/InputFiles/',
                arrayKey: '',
                data: {
                    files: [$scope.reduceFile, $scope.mapFile, $scope.dataFile],
                    map: $scope.mapFile.name,
                    reduce: $scope.reduceFile.name,
                    data: $scope.dataFile.name,
                    group: group_id,
                    job: job_id
                },
                headers : {'x-access-token' : token }
            }).then(function (resp) {
                // console.log(JSON.stringify(resp.data));
            }, null, function (evt) {
                var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                // console.log(evt.config.data);
                $scope.log = progressPercentage;
                $scope.percentage = progressPercentage;
            });
        }       
    }

    // are all the jobs properly initialized?
    jobsInit = function(files) {
        var len = Object.keys(files).length
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
            $scope.upload($scope.allFiles,$scope.selectedGroup, job_id);
        },function(rsp) {  
            console.log('error?');
            console.log(rsp.data);
        });
    }

    $scope.getUser = function(){
        $http({
            url: '/api/user',
            method: "GET",
            headers: {'x-access-token' : token }
        }).then(function(rsp) {
            $scope.user = rsp.data;
            $scope.myGroups = rsp.data.groups;

        },function(rsp) {
            console.log(rsp);
        });
    }

    $scope.getUser();


   
}]);