angular.module('starter.controllers', [])

.controller('UserThreadChatCtrl', function ($scope) {

})

.controller('UserThreadCtrl', function ($scope, $stateParams) {

})

.controller('NearbyThreadCtrl', function ($scope, NearbyThreadsGetter, AuthTokenFactory, UserFactory) {
    $scope.votesortime = false;
    $scope.activeButton = 2;

    $scope.myOrderBy = function (post) {

        if ($scope.votesortime) {
            return post.vote;
        } else {
            var myDate = new Date(post.timestamp);
            var withOffset = myDate.getTime();
            return withOffset;
        };
    }

    $scope.topSortToggle = function () {
        $scope.votesortime = true;
        $scope.activeButton = 1;
        $scope.apply;
    }
    $scope.recentSortToggle = function () {
        $scope.votesortime = false;
        $scope.activeButton = 2;
        $scope.apply;
    }
    $scope.nearbyRefresh = function () {
        navigator.geolocation.getCurrentPosition(function (position) {
            console.log("latitude from geolocation: ", position.coords.latitude)
            console.log("Longitude from geolocation: ", position.coords.longitude)

            NearbyThreadsGetter.nearbyRefresh({
                    "latitude": position.coords.latitude,
                    "longitude": position.coords.longitude
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
                UserFactory.getUser().then(function success(response) {
                    console.log("latitude: ", position.coords.latitude);
                    console.log("longitude: ", position.coords.longitude);
                    console.log("content: ", $scope.post.content);
                    console.log("author: ", response.data.user)

                    NearbyThreadsGetter.nearbyPost({
                        "post": {
                            "latitude": position.coords.latitude,
                            "longitude": position.coords.longitude,
                            "content": $scope.post.content,
                            "author": response.data.user
                        },
                        "token": AuthTokenFactory.getToken()
                    }, function (post) {
                        post.post.timestamp = Date.now();
                        $scope.posts.splice(0, 0, post.post);
                    });
                    $scope.nearbyRefresh();
                    $scope.post.content = null;
                })
            }, function (error) {
                alert(error);
            });
        } else {
            alert("You are not signed in. Posting requires that you sign in.");
        }
    }

    $scope.vote = function (postid, dirCondition) {
        console.log("Vote function active on post: " + postid);
        if (dirCondition) {
            console.log("Upvoting");
            NearbyThreadsGetter.upvote(postid);
        } else {
            console.log("Downvoting");
            NearbyThreadsGetter.downvote(postid);
        }
        setTimeout(function(){ $scope.nearbyRefresh();}, 10);

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
        console.dir(response.data.user);
        $scope.user = response.data.user;
        $scope.hideAllSignins = true;
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
        if ($scope.showInfo) {
            $scope.showInfo = false;
        } else {
            $scope.showInfo = true;
        }
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