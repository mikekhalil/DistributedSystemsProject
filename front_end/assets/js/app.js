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
    .otherwise({redirectTo: '/'});
})
    .run(run);


  function run($rootScope, $http, $location, $localStorage) {
        // keep user logged in after page refresh
        if ($localStorage.currentUser) {
            $http.defaults.headers.common.Authorization = 'Bearer ' + $localStorage.currentUser.token;
        }
 
        // redirect to login page if not logged in and trying to access a restricted page
        $rootScope.$on('$locationChangeStart', function (event, next, current) {
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



