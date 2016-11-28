app.controller('loginController', ['UserService','$rootScope','$scope','$localStorage','$location','$http',  function(User,$rootScope,$scope,$localStorage,$location,$http){
        
        closeModal = function(id) {
            $(id).modal('hide');
        }
        if($localStorage.currentUser){
            //already logged in, bring them to dashboard
            $location.path('/dashboard');
        }    

        $scope.createUser = function() { 
            console.log($scope.registerName + " " + $scope.registerEmail + " " + $scope.registerPassword);
            $http({
                    url: '/registerUser',
                    method: "POST",
                    data: { name : $scope.registerName, email: $scope.registerEmail, pw: $scope.registerPassword}
                })
                .then(function(rsp) {
                    // success
                
                   
                    Authenticate($scope.registerEmail, $scope.registerPassword, function (result) {
                        console.log(result);
                        closeModal('#regModal');
                        closeModal('#regModal');

                        $location.path('/dashboard');
                        
                    });
                    
                }, 
                function(rsp) { 
                    // failed
                    console.log(rsp);
                    //generate error message
                });
            
        }

       
        function Authenticate(username, password, callback) {
            $http({
                url: '/authenticate',
                method: "POST",
                data: { email : username, password : password }
            })
            .then(function(rsp) {
                // success
                if (rsp.data.token) {
                    console.log('what');
                    // store username and token in local storage to keep user logged in between page refreshes
                    $localStorage.currentUser = { username: username, token: rsp.data.token };
                    User.setUser($localStorage.currentUser);
                    // add jwt token to auth header for all requests made by the $http service
                    $http.defaults.headers.common.Authorization = 'Bearer ' + rsp.data.token;
                    $rootScope._user = $localStorage.currentUser;

                    // execute callback with true to indicate successful login
                    callback(true);
                } 
                else {
                    // execute callback with false to indicate failed login
                    callback(false);
                }
            }, 
            function(rsp) { 
                // failed
                console.log(rsp);
             });
        }
 
        function Deauthenticate() {
            // remove user from local storage and clear http auth header
            $rootScope._name = "";
            delete $localStorage.currentUser;
            if ($http.defaults) {
                $http.defaults.headers.common.Authorization = '';
            }
            $location.path('/');
        }
        function login() {
            Authenticate($scope.username, $scope.password, function (result) {
                if (result === true) {
                    $location.path('/dashboard');
                } else {
                    $scope.error = 'Username or password is incorrect';
                    vm.loading = false;
                }
            });
        };

         
        
        var vm = this;
        vm.login = login;
        $scope.login = login;
        $rootScope.logout = Deauthenticate;
}]);
 