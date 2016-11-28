app.service('UserService',['$http', '$localStorage', function authenticationServiceFactory($http,$localStorage) {
        var service = this;
        var _user = null;
        
        service.setUser = function(user) {
            _user = user;
        }
        service.getUser = function() {
            return _user;
        }

        return service;

}]);
 