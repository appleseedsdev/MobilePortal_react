apple.controller('AdminDashboard', ['$rootScope', '$scope', '$state', '$http','userService','Upload', 'server', function ($rootScope, $scope, $state, $http,userService,Upload, server) {
    $rootScope.stateName = "AdminDashboard";

    $scope.NetaCandidatesViewers=[];

    $scope.toAssignNetaCandidatesViewers=[];

    $scope.newUseridsViewersToSave=[];

    $scope.UseridsViewersToDelete=[];

    $scope.UsersInThePopUp=[];

    $scope.AddNetaCandidatesViewers=function() {

        $scope.OpenNetaCandidatesViewersPopUp();
    }

    $scope.OpenNetaCandidatesViewersPopUp = function() {

        $scope.ShowNetaCandidatesViewersPopUp = true;
    }

    $scope.CloseNetaCandidatesViewersPopUp = function() {

        $scope.ShowNetaCandidatesViewersPopUp = false;

        $scope.toAssignNetaCandidatesViewers=[];
    }

    var GetNetaCndidatesViewers=function() {

        var data={}
        server.requestPhp(data, 'GetNetaCandidatesViewers').then(function (data) {
            $scope.NetaCandidatesViewers=data;
        });
    }

    GetNetaCndidatesViewers();

    $scope.searchNetaCandidatesViewers = function (search, page,onSuccess) {

        var desc = false;
        var data ={'search': search, 'page': page};
        server.requestPhp(data, 'searchNetaCandidatesViewers').then(function (data) {
            if(data.error)
                return;
            else
            {
                onSuccess(data);
                $scope.UsersInThePopUp=data.NetaCandidatesViewers;
            }
        });
    }

    $scope.addNetaCandidatesViewersToList = function(user) {

        if($scope.toAssignNetaCandidatesViewers.indexOf(user.userid)==-1)
            $scope.toAssignNetaCandidatesViewers.push(user.userid);

        else
            $scope.toAssignNetaCandidatesViewers.splice($scope.toAssignNetaCandidatesViewers.indexOf(user.userid), 1);
    };

    $scope.commitNewNetaCandidatesViewers = function () {

        for(var i =0;i<$scope.toAssignNetaCandidatesViewers.length;i++)
        {
            var CheckIfViewerExistInNetaCandidatesViewers=false;

            for(var j=0;j<$scope.NetaCandidatesViewers.length;j++)
            {
                if($scope.NetaCandidatesViewers[j].userid==$scope.toAssignNetaCandidatesViewers[i]) {
                    CheckIfViewerExistInNetaCandidatesViewers=true;
                    break;
                }
            }
           if(!CheckIfViewerExistInNetaCandidatesViewers) {
               var userFromPopUp=GetUserFromUsersInPopUpByUserId($scope.toAssignNetaCandidatesViewers[i]);
               if(userFromPopUp!=false)
               {
                   $scope.NetaCandidatesViewers.push(userFromPopUp);
                   $scope.newUseridsViewersToSave.push($scope.toAssignNetaCandidatesViewers[i]);
               }
           }
        }
        $scope.CloseNetaCandidatesViewersPopUp();
    };

    var GetUserFromUsersInPopUpByUserId= function(userid) {

        for(var i=0;i<$scope.UsersInThePopUp.length;i++)
        {
            if($scope.UsersInThePopUp[i].userid==userid) {
                return $scope.UsersInThePopUp[i];
            }
        }
        return false;
    }

    $scope.DeleteViewer = function(viewer){
        $scope.UseridsViewersToDelete.push(viewer.userid);
        $scope.NetaCandidatesViewers.splice($scope.NetaCandidatesViewers.indexOf(viewer), 1);
    }

    $scope.Save=function()
    {
        var data = {};
        data.newUseridsViewersToSave=$scope.newUseridsViewersToSave;
        data.UseridsViewersToDelete=$scope.UseridsViewersToDelete;
        server.requestPhp(data, 'UpdateNetaCandidatesViewers').then(function (data) {
            alertSaveResults(data);
            $scope.newUseridsViewersToSave=[];
            $scope.UseridsViewersToDelete=[];
        });
    }

    $scope.Cancel = function(){

    }

    var alertSaveResults = function (data) {

        if(data==undefined )
            alert("שגיאה בנתונים - הפעולה לא נשמרה");

        else if (data.error)
            alert(data.error);

        else {
            alert("נשמר בהצלחה");
        }
    }


} ]);


