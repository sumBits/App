'use strict';

angular.module('starter.services', [], function config ($httpProvider) {
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
    
    function signup(s_name, s_age, s_email, s_pwd){
        return $http.post(API_URL + '/newUser', {
            "email": s_email,
            "password": s_pwd,
            "name": s_name,
            "age": s_age
        }).then(function success(response){
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
.factory('AuthInterceptor', function AuthInterceptor(AuthTokenFactory){
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
});