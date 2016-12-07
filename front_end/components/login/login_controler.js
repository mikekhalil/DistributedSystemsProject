app.controller('loginController', ['$rootScope','$scope','$localStorage','$location','$http',  function($rootScope,$scope,$localStorage,$location,$http){
        
        closeModal = function(id) {
            $(id).modal('hide');
            $('.modal').removeClass('show');
            $('.modal-backdrop').remove();
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
                        //closeModal('#regModal');

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
                    //store current user data in local storage
                    $localStorage.currentUser = {userData:rsp.data.user, username: username, token: rsp.data.token };
                    $http.defaults.headers.common.Authorization = 'Bearer ' + rsp.data.token;
                    $rootScope._user = rsp.data.user;
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
}]);
 