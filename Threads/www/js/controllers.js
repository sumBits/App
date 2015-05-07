angular.module('starter.controllers', [])

.controller('UserThreadChatCtrl', function ($scope) {

})

.controller('UserThreadCtrl', function ($scope, $stateParams) {

})

.controller('NearbyThreadCtrl', function ($scope, NearbyThreadsGetter, AuthTokenFactory) {

    $scope.nearbyRefresh = function () {
        navigator.geolocation.getCurrentPosition(function (position) {
            $scope.currentLocation = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
            console.log("latitude: ", $scope.currentLocation.k);
            console.log("longitude: ", $scope.currentLocation.D);

            NearbyThreadsGetter.nearbyRefresh({
                    "latitude": $scope.currentLocation.k,
                    "longitude": $scope.currentLocation.D
                })
                .then(function (response) {
                    $scope.posts = response;
                }).finally(function () {
                    $scope.$broadcast('scroll.refreshComplete');
                });

        }, function (error) {
            alert(error);
        });
    };

    $scope.nearbyPost = function () {
        if (AuthTokenFactory.getToken()) {
            navigator.geolocation.getCurrentPosition(function (position) {
                $scope.currentLocation = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
                console.log("latitude: ", $scope.currentLocation.k);
                console.log("longitude: ", $scope.currentLocation.D);

                NearbyThreadsGetter.nearbyPost({
                    "post": {
                        "latitude": $scope.currentLocation.k,
                        "longitude": $scope.currentLocation.D,
                        "content": $scope.post.content,
                        "author": $scope.user.username
                    },
                    "token": AuthTokenFactory.getToken()
                }, function(post){
                    post.post.timestamp = Date.now();
                    $scope.posts.push(post.post);
                });

                $scope.post.content = null;

            }, function (error) {
                alert(error);
            });
        } else {
            alert("You are not signed in. Posting requires that you sign in.");
        }
    }
})

.controller('AccountCtrl', function ($scope, UserFactory) {

    $scope.hideAllSignins = false;
    $scope.showSignupForm = false;
    $scope.showLoginForm = false;
    $scope.showFBLogin = false;
    $scope.showInfo = false;

    // initialization
    UserFactory.getUser().then(function success(response) {
        $scope.user = response.data;
    });

    $scope.toggleSignupForm = function () {
        $scope.showSignupForm = !($scope.showSignupForm);
        $scope.showLoginForm = false;
        $scope.showFBLogin = false;
    }

    $scope.toggleLoginForm = function () {
        $scope.showLoginForm = !($scope.showLoginForm);
        $scope.showSignupForm = false;
        $scope.showFBLogin = false;
    }

    $scope.toggleFBLogin = function () {
        $scope.showFBLogin = !($scope.showFBLogin);
        $scope.showSignupForm = false;
        $scope.showLoginForm = false;
    }

    $scope.toggleInfo = function () {
        $scope.showInfo = true;
    }

    $scope.signup = function (usn, age, em, pwd) {
        UserFactory.signup(usn, age, em, pwd).then(function success(response) {
            $scope.signup.usn = null;
            $scope.signup.age = null;
            $scope.signup.em = null;
            $scope.signup.pwd = null;
            console.log(response);
            $scope.login(em, pwd);
        }, function handleError(response) {
            alert('Error: ' + response.data);
        });
    }

    $scope.login = function (em, pwd) {
        UserFactory.login(em, pwd).then(function success(response) {
            UserFactory.getUser().then(function success(response) {
                $scope.user = response.data.user;
                $scope.username = response.data.username;
                console.log(response.data);
            });
            $scope.login.em = null;
            $scope.login.pwd = null;
            $scope.hideAllSignins = true;
        }, function handleError(response) {
            alert('Error: ' + response.data);
        });
    }

    $scope.FBLogin = function (em, pwd) {

    }

    $scope.logout = function () {
        UserFactory.logout();
        $scope.user = null;
        $scope.username = null;
        $scope.hideAllSignins = false;
    }

});