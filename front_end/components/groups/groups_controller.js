app.controller('groupsController', ['$rootScope','$location', '$route', '$scope','$http','$localStorage', function($rootScope,$location,$route,$scope, $http, $localStorage) {
    closeModal = function(id) {
    	$(id).modal('hide');
		$('.modal').removeClass('show');
    }
    var token = $localStorage.currentUser.token
    
    $scope.groups = [];
	$scope.myGroups = [];
    $scope.getGroups = function() {
    	$http( {
    		url: '/api/groups',
    		method: 'GET',
    		headers : {'x-access-token' : token}
    	}).then(function(rsp) {
    		//success
    		$scope.groups = rsp.data.groups;
    		for(var i = 0; i < $scope.groups.length; i++) {
    			$scope.groups[i]['numUsers'] = $scope.groups[i].users.length;
    			$scope.groups[i]['numJobs'] = $scope.groups[i].jobs.length;
				$scope.groups[i]['myGroups'] = false;
		
				if($scope.myGroups.indexOf($scope.groups[i].name) > -1){
					$scope.groups[i]['myGroups'] = true; 
				}
    		}
    	},
    	function(rsp) {
    		//error
    		console.log('error');
    		console.log(rsp);
    	});
    }
    
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
				$scope.getUser();
                $scope.getGroups();
				$rootScope._mq.messenger.publishTo("manager", "CreateGroup", {group_id : $scope.groupName, user : $rootScope._user, sock_id: $rootScope._socket.io.engine.id });
                
            }, 
            function(rsp) { 
                // failed
               	console.log( $http.defaults.headers['x-access-token']);
            	console.log(rsp);
             	//generate error message
             });

    }
	$scope.joinGroup = function(group) {
		console.log(group);
		$http({
			url: '/api/joinGroup',
			method: "POST",
			data: { group : group },
			headers: {'x-access-token' : token }
		}).then(function(rsp) {
			//success
			console.log(rsp);
			$scope.getUser();
			$scope.getGroups();
			$rootScope._mq.messenger.publishTo("manager", "JoinGroup", {group_id : group, user : $rootScope._user, sock_id: $rootScope._socket.io.engine.id });
		},function(rsp) {
			//failed
			console.log('fail');
			console.log(rsp);
			//TODO generate error message ("already in group"
		});
	}

	$scope.getUser = function(){
		$http({
			url: '/api/user',
			method: "GET",
			headers: {'x-access-token' : token }
		}).then(function(rsp) {
			$scope.myGroups = rsp.data.groups;
			$scope.getGroups();
		},function(rsp) {
			console.log(rsp);
		});
	}

	$scope.getUser();
	
}]);
