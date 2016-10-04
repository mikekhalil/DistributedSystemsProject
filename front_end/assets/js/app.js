var app = angular.module('cream',['ngRoute','ngFileUpload']);

app.config(function($routeProvider) {
  $routeProvider
  .when('/', {
    templateUrl : 'components/data_upload/data_upload.html',
    controller  : 'uploadController'
  })

  .otherwise({redirectTo: '/'});
});



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



