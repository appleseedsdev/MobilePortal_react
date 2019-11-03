apple.directive('header', ['$state', '$stateParams', '$rootScope', '$http', 'userService', 'server', function ($state, $stateParams, $rootScope, $http, userService, server) {
    return {
        restrict: 'E',
        templateUrl: './directives/header/header.html',
        link: function (scope, el, attrs) {
            scope.openMainMenu = true;
            scope.openAdminMenu = true;
            if (!$rootScope.activeUser){
                $rootScope.activeUser = localStorage.getItem('activeUser');
            }
            scope.goToUserProfile = function (user) {
                $state.transitionTo('singleUser', {
                    userId: $rootScope.activeUser.userid
                });
            }
            scope.logout = function () {
                userService.logout();
            }

            scope.nomineeAccessUserList=[];
            var GetNetaCndidatesViewers=function() {
                var data={}
                server.requestPhp(data, 'GetNetaCandidatesViewers').then(function (data) {
                    for(var i=0;i<data.length;i++)
                    {
                        scope.nomineeAccessUserList.push(data[i].userid);
                    }
                });
            }
            GetNetaCndidatesViewers();
        },
        replace: true
    };
} ]);
