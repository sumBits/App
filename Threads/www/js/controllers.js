angular.module('starter.controllers', [])

.controller('DashCtrl', function ($scope) {})

.controller('ChatsCtrl', function ($scope, Chats) {
    $scope.chats = Chats.all();
    $scope.remove = function (chat) {
        Chats.remove(chat);
    }
})

.controller('ChatDetailCtrl', function ($scope, $stateParams, Chats) {
    $scope.chat = Chats.get($stateParams.chatId);
})

.controller('FriendsCtrl', function ($scope, Friends) {
    $scope.friends = Friends.all();
})

.controller('FriendDetailCtrl', function ($scope, $stateParams, Friends) {
        $scope.friend = Friends.get($stateParams.friendId);
})
.controller('LoginCtrl', function ($scope) {
    $scope.signup = function (usn, em, pwd) {
            $scope.showsignupform = "false";
            signupFunction(usn, em, pwd);
        };
        $scope.login = function (em, pwd) {
            loginFunction(em, pwd);
        };
    })
.controller('AccountCtrl', function ($scope) {
        $scope.settings = {
            enableFriends: true
        };
});