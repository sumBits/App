angular.module('starter.controllers', [])

.controller('DashCtrl', function ($scope) {})

.controller('UserThreadChatCtrl', function ($scope) {
   
})

.controller('UserThreadCtrl', function ($scope, $stateParams) {
    
})

.controller('AccountCtrl', function ($scope, UserFactory) {
    
    $scope.hideAllSignins = false;
    $scope.showSignupForm = false;
    $scope.showLoginForm = false;
    $scope.showFBLogin = false;
    
    // initialization
    UserFactory.getUser().then(function success(response) {
        $scope.user = response.data;
    });
    
    $scope.toggleSignupForm = function(){
        $scope.showSignupForm = !($scope.showSignupForm);
        $scope.showLoginForm = false;
        $scope.showFBLogin = false;
    }
    
    $scope.toggleLoginForm = function(){
        $scope.showLoginForm = !($scope.showLoginForm);
        $scope.showSignupForm = false;
        $scope.showFBLogin = false;
    }
    
    $scope.toggleFBLogin = function(){
        $scope.showFBLogin = !($scope.showFBLogin);
        $scope.showSignupForm = false;
        $scope.showLoginForm = false;
    }
    
    $scope.signup = function(usn,age,em,pwd){
        UserFactory.signup(usn,age,em,pwd).then(function success(response){
            $scope.signup.usn = null;
            $scope.signup.age = null;
            $scope.signup.em = null;
            $scope.signup.pwd = null;
            console.log(response);
            $scope.login(em,pwd);
        }, function handleError(response){
            alert('Error: ' + response.data);
        });
    }
    
    $scope.login = function(em,pwd){
        UserFactory.login(em, pwd).then(function success(response) {
            UserFactory.getUser().then(function success(response) {
                $scope.user = response.data.user;
                console.log(response.data);
            });
            $scope.login.em = null;
            $scope.login.pwd = null;
            $scope.hideAllSignins = true;
        }, function handleError(response) {
            alert('Error: ' + response.data);
        });       
    }
    
    $scope.FBLogin = function(em, pwd){
    
    }
    
    $scope.logout = function(){
        UserFactory.logout();
        $scope.user = null;
        $scope.hideAllSignins = false;
    }
    
});