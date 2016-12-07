app.factory('User', function($http) {
    class User {
        constructor(token) {
            this.token = token;
        }
        getData(cb){
            $http({
			    url: '/api/user',
			    method: "GET",
			    headers: {'x-access-token' : this.token }
		    }).then(function(rsp) {
                cb(null,rsp.data);
		    },function(rsp) {
			    console.log(rsp);
		    });
        }
    }
    return User;
});