angular.module('starter.controllers', [])

.controller('UserThreadChatCtrl', function ($scope, $stateParams, UserThreadsGetter, AuthTokenFactory, UserFactory) {
    var username;
    $scope.submitPost = function (post) {
        if (AuthTokenFactory.getToken()) {
            UserFactory.getUser().then(function success(response) {
                UserThreadsGetter.postToThread($stateParams.uThreadId, post, username).then(function success(response) {
                    $scope.getPosts();
                });
            });
            $scope.post = null;
        } else {
            alert("You are not signed in. Posting to User Threads requires that you be signed in.")
        }
    }

    $scope.getPosts = function () {
        UserThreadsGetter.getPosts($stateParams.uThreadId, function (data) {
            $scope.posts = data;
            username = $scope.posts[0].author;
            console.log("USN IS " + username);
        });
    }
})

.controller('UserThreadCtrl', function ($scope, $timeout, $ionicPopup, UserThreadsGetter, UserFactory, AuthTokenFactory) {
    $scope.getUserThreads = function () {
        if (AuthTokenFactory.getToken()) {
            UserFactory.getUser().then(function success(response) {
                UserThreadsGetter.getUserThreadsUpdated(response.data.user, function (data) {
                    $scope.userThreads = data;
                });
            });
        } else {
            alert("You are not signed in. Viewing User Threads requires that you be signed in.")
        }
    }
    $scope.userPost = function () {
        $scope.newthreaddata = {};

        var myPopup = $ionicPopup.show({
            template: '<input type="text" ng-model="newthreaddata.title">',
            title: 'Enter title of your Thread!',
            subTitle: 'Read the rules before creating a new Thread!',
            scope: $scope,
            buttons: [
                {
                    text: 'Cancel'
                },
                {
                    text: '<b>Create!</b>',
                    type: 'button-positive',
                    onTap: function (e) {
                        if (!$scope.newthreaddata.title) {
                            e.preventDefault();
                        } else {
                            var rn1 = Math.floor(Math.random() * (122 - 48 + 1)) + 48;
                            var rn2 = Math.floor(Math.random() * (122 - 48 + 1)) + 48;
                            var rn3 = Math.floor(Math.random() * (122 - 48 + 1)) + 48;
                            var rn4 = Math.floor(Math.random() * (122 - 48 + 1)) + 48;
                            var rn5 = Math.floor(Math.random() * (122 - 48 + 1)) + 48;
                            
                            Math.round(rn1, rn2, rn3, rn4, rn5);
                            var GenID = String.fromCharCode(rn1, rn2, rn3, rn4, rn5);

                            console.log("Gen id: " + GenID);
                            console.log("Title: " + $scope.newthreaddata.title);
                            UserThreadsGetter.createUThread($scope.newthreaddata.title, GenID);
                            UserFactory.getUser().then(function success(response) {
                                console.log("User: " + response.data.user);
                                console.log("ID: " + GenID);
                                UserThreadsGetter.joinThread(response.data.user,GenID);
                            });
                        }
                    }
                }
            ]
        });
    }

    $scope.subscribe = function() {
        $scope.iddata = {};

        var subscribePopup = $ionicPopup.show({
            template: '<input type="text" ng-model="iddata.threadSubID">',
            title: 'Enter ID for your thread!',
            subTitle: 'Recieve this code from your teacher',
            scope: $scope,
            buttons: [
                {
                    text: 'Cancel'
                },
                {
                    text: '<b>Subscribe!</b>',
                    type: 'button-positive',
                    onTap: function (e) {
                        console.log($scope.iddata.threadSubID);
                        if (!$scope.iddata.threadSubID) {
                            console.log("Preventing button press")
                            e.preventDefault();
                        } else {
                            console.log("Subscribe button pressed")
                            UserFactory.getUser().then(function success(response) {
                                console.log("User: " + response.data.user);
                                console.log("ID: " + $scope.iddata.threadSubID);
                                UserThreadsGetter.joinThread(response.data.user,$scope.iddata.threadSubID);
                            });
                        }
                    }
                }
            ]
        });
    }
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
        setTimeout(function () {
            $scope.nearbyRefresh();
        }, 10);

    };
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