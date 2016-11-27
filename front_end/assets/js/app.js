var app = angular.module('cream',['ngStorage','ngRoute','ngFileUpload']);

app.config(function($routeProvider) {
  $routeProvider
  .when('/upload', {
    templateUrl : 'components/data_upload/data_upload.html',
    controller  : 'uploadController',
    activetab : 'upload'
  })
    .when('/', {
        templateUrl: 'components/login/login.html',
        controller : 'loginController',
        activetab : 'login'
  })
    .when('/dashboard',{
        templateUrl: 'components/dashboard/dashboard.html',
        controller : 'dashboardController',
        activetab : 'dashboard'
  })
   .when('/groups',{
        templateUrl: 'components/groups/groups.html',
        controller : 'groupsController',
        activetab : 'groups'
  })
   .when('/profile',{
        templateUrl: 'components/profile/profile.html',
        controller : 'profileController',
        activetab : 'profile'
  })
    .otherwise({redirectTo: '/'});
})
    .run(run);


  function run($rootScope, $http, $location, $localStorage) {
        // keep user logged in after page refresh
        if ($localStorage.currentUser) {
            //TODO FIX default header issues ideally
            $http.defaults.headers['x-access-token'] = $localStorage.currentUser.token;
            $rootScope._user = $localStorage.currentUser;
        }
        else {
            $rootScope._user = null;
        }
 
        // redirect to login page if not logged in and trying to access a restricted page
        $rootScope.$on('$locationChangeStart', function (event, next, current) {
            //todo : create keep alive API endpoint - verify if token hasn't expired during refresh
            var publicPages = ['/', '/register'];
            var restrictedPage = publicPages.indexOf($location.path()) === -1;
            if (restrictedPage && !$localStorage.currentUser) {
                $location.path('/');
            }
        });
    }

app.directive('fileModel', ['$parse', function ($parse) {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            var model = $parse(attrs.fileModel);
            var modelSetter = model.assign;

            element.bind('change', function(){
                scope.$apply(function(){
                    modelSetter(scope, element[0].files[0]);
                });
            });
        }
    };
}]);



