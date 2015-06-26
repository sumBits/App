'use strict';

angular.module('starter.services', [], function config($httpProvider) {
    $httpProvider.interceptors.push('AuthInterceptor');
})

.constant('API_URL', 'http://52.10.238.99:8080')

.factory('UserFactory', function UserFactory($http, API_URL, AuthTokenFactory, $q) {
    return {
        login: login,
        logout: logout,
        getUser: getUser,
        signup: signup
    };

    function login(email, password) {
        return $http.post(API_URL + '/login', {
            email: email,
            password: password
        }).then(function success(response) {
            AuthTokenFactory.setToken(response.data.token);
            return response;
        });
    }

    function logout() {
        AuthTokenFactory.setToken();
    }

    function getUser() {
        if (AuthTokenFactory.getToken()) {
            return $http.post(API_URL + '/me', {
                token: AuthTokenFactory.getToken()
            });
        } else {
            return $q.reject({
                data: 'client has no auth token'
            });
        }
    }

    function signup(s_name, s_age, s_email, s_pwd) {
        return $http.post(API_URL + '/newUser', {
            "email": s_email,
            "password": s_pwd,
            "username": s_name,
            "age": s_age
        }).then(function success(response) {
            return response;
        });
    }
})

.factory('AuthTokenFactory', function AuthTokenFactory($window) {
        var store = $window.localStorage;
        var key = 'auth-token';
        return {
            getToken: getToken,
            setToken: setToken
        };

        function getToken() {
            return store.getItem(key);
        }

        function setToken(token) {
            if (token) {
                store.setItem(key, token);
            } else {
                store.removeItem(key);
            }
        }
    })
    .factory('AuthInterceptor', function AuthInterceptor(AuthTokenFactory) {
        return {
            request: addToken
        };

        function addToken(config) {
            var token = AuthTokenFactory.getToken();
            if (token) {
                config.headers = config.headers || {};
                config.headers.Authorization = 'Bearer ' + token;
            }
            return config;
        }
    })

.factory('UserThreadsGetter', function UserThreadsGetter($http, API_URL) {
    var factory = {
        getUserThreads: getUserThreads,
        joinThread: joinThread,
        postToThread: postToThread,
        getPosts: getPosts
    };

    function getUserThreads(user, next) {
        console.log("Getting User Threads on the front end for user: " + user);


        $http.post(API_URL + '/getUserThreads', {
            data: user
        }).then(function success(response) {
            console.log("User Thread retrieval successful.");
            if (response.data == "nothing") {
                var testData = [{
                    name: "AP Calculus BC",
                    id: "1"
            }, {
                    name: "AP Physics C",
                    id: "2"
            }, {
                    name: "Best Marvel Movies",
                    id: "3"
                }];
                console.log("Got no threads from server, returning test data.");
                next(testData);
            } else {
                next(response.data);
            }

        });
    }

    var testPosts = [];

    function getPosts(threadId, next) {
        console.log("Getting posts in the thread with id: " + threadId);
        testPosts = [{
            author: "Anirudh",
            content: "Hi guys"
        }, {
            author: "Spencer",
            content: "What's up?"
        }];

        $http.post(API_URL + '/getPostsInUThread', {
            data: threadId
        }).then(function success(response) {
            console.log("Posts in User Thread retrieval successful.")
            if (response.data != "nothing") {
                next(response.data);
            } else {
                next(testPosts);
            }
        });
    }

    function joinThread(threadId, user) {
        console.log(user + " is joining thread with id: " + threadId + " on the front end.");
    }

    function postToThread(threadId, post, user) {
        if (post == null) {
            alert("Please enter something to post.");
        } else {
            console.log("Front end is attempting to post into this user thread: " + threadId);
            post.author = user;
            post.threadId = threadId;
            return $http.post(API_URL + '/postToUThread', {
                data: post
            }).then(function success(response) {
                console.log("Posting was successful.");
            });

        }
    }

    return factory;
})

.factory('NearbyThreadsGetter', function NearbyThradsGetter($http, API_URL) {
    var factory = {
        nearbyRefresh: nearbyRefresh,
        nearbyPost: nearbyPost,
        upvote: upvote,
        downvote: downvote
    };

    factory.getNearby = function (location) {
        return $http.post(API_URL + '/nearbyRO', location)
            .then(function success(response) {
                console.log("Returned data:\n" + response);
                console.dir(response);
                return response.data;
            });
    }

    function upvote(id) {
        return $http.post(API_URL + '/upvote', {
            headers: 'application/json',
            data: id
        }).then(function success(response) {
            console.log("Upvote Successful")
        });
    }

    function downvote(id) {
        return $http.post(API_URL + '/downvote', {
            headers: 'application/json',
            data: id
        }).then(function success(response) {
            console.log("Downvote Successful")
        });
    }

    function nearbyPost(post, cb) {
        return $http.post(API_URL + '/nearbyPost', post)
            .then(function success(response) {
                cb(post);
                console.log("Comment has been posted");
            });
    }

    function nearbyRefresh(location) {
        return factory.getNearby(location);
    }

    return factory;
});