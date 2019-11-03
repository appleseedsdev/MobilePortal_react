apple.controller('singleLesson', ['$rootScope', '$scope', '$state', '$stateParams', '$http', '$q', 'userService', 'Upload','server',
    function($rootScope, $scope, $state, $stateParams, $http, $q, userService, Upload, server) {

        $scope.lessonid = $stateParams.lessonId;
        $scope.lessonNum = $stateParams.lessonNum;

        var GetStudentsAttendance=function()
        {
            var data ={};
            data.lessonid=$scope.lessonid;
            server.requestPhp(data, 'GetStudentsAttendance'
            ).then(function (data) {
                $scope.lesson = data;

               console.log($scope.lesson);
            });
        }
        GetStudentsAttendance();


        $scope.AttendanceStatuses = [];
        var GetAttendanceStatuses = function() {
            var data ={};
            server.requestPhp(data, 'GetAttendanceStatuses').then(function (data) {
                $scope.AttendanceStatuses = data;
                console.log($scope.AttendanceStatuses);
            });
        };
        GetAttendanceStatuses();


        $scope.UpdateCheckStudentStatus = function(student) {
            console.log("UpdateCheckStudentStatus");
            console.log(student);
            var data={};
            data.student = student;
            data.lessonid=$scope.lessonid;
             if(student.checkstudentid==null)
             {
                 server.requestPhp(data, 'AddCheckStudentStatus').then(function (data) {
                     if(data.error)
                     {
                         alert(data.error);
                     }
                     else
                     {
                         //display 'saved successfully' message
                         alert("נשמר בהצלחה");
                         GetStudentsAttendance();
                     }

                 });
             }
             else
             {
                 server.requestPhp(data, 'UpdateCheckStudentStatus').then(function (data) {
                     if(data.error)
                     {
                         alert(data.error);
                     }
                     else
                     {
                         //display 'saved successfully' message
                         alert("נשמר בהצלחה");
                         GetStudentsAttendance();
                     }
                 });
             }

        };

        $scope.goBack = function(){
                window.history.back();

        };


    }]);
