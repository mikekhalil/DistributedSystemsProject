app.controller('groupsController', ['$location', '$route', '$scope','$http','$localStorage', function($location,$route,$scope, $http, $localStorage) {
    closeModal = function(id) {
    	$(id).modal('hide');
    }
    var token = $localStorage.currentUser.token
    
    $scope.groups = [
    {
    	"gName": "Xinu",
    	"gNumUsers": "2",
    	"gNumJobs": "50"
    }, {
    	"gName": "7>5 Layer Model",
    	"gNumUsers": "7",
    	"gNumJobs": "777"
    }];

    $scope.getGroups = function() {
    	
    	$http( {
    		url: '/api/groups',
    		method: 'GET',
    		headers : {'x-access-token' : token}
    	}).then(function(rsp) {
    		//success
    		console.log('success');
    		$scope.groups = rsp.data.groups;
    		for(var i = 0; i < $scope.groups.length; i++) {
    			$scope.groups[i]['numUsers'] = $scope.groups[i].users.length;
    			$scope.groups[i]['numJobs'] = $scope.groups[i].jobs.length;
    		}
    	},
    	function(rsp) {
    		//error
    		console.log('error');
    		console.log(rsp);
    	});

    	

    

    }
    $scope.getGroups();
    $scope.createGroup = function() { 
    	$http({
                url: '/api/registerGroup',
                method: "POST",
                data: { name : $scope.groupName},
				headers: {'x-access-token' : token }
            })
            .then(function(rsp) {
                // success
                closeModal('#myModal');
                $scope.getGroups();
                
            }, 
            function(rsp) { 
                // failed
               console.log( $http.defaults.headers['x-access-token']);
                console.log(rsp);
             	//generate error message
             });

    }
}]);

/*
app.controller('groupsController', ['$scope', function($scope) {
  $scope.double = function(value) { return value * 2; };
}]);
*/