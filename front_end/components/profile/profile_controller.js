app.controller('profileController', ['$http', '$location', '$scope','$rootScope','$localStorage', function($http, $location,$scope,$rootScope,$localStorage) {


$scope.$on('InputSplitUpdate', (event,data)=> {
    console.log(data);
});


}]);