apple.controller('syllabus', ['$scope', '$stateParams', '$rootScope', '$state', '$timeout', 'server', '$filter',
function($scope, $stateParams, $rootScope, $state, $timeout, server, $filter) {
	$scope.lessonId=$stateParams["lessonId"];
	$scope.courseId=$stateParams["courseId"];
	$scope.lesson = {};
	$scope.lesson.subjectsTaught=[];
    $scope.customSubjects=[];
    $scope.syllabus=[];
    $scope.subjectsTaught=[];

  //sets the header title to "loading" - until the correct title is fetched from the server
	$rootScope.$broadcast('setHeaderTitle', {title : $rootScope.dictionary.loading});

	$scope.getLesson = function () {
			var data = {};
			data.lessonid = $stateParams["lessonId"];
			server.requestPhp(data, "GetLessonById").then(function (data) {
				$scope.lesson = data.lesson;
                $scope.customSubjectsLength=$scope.lesson.customSubjects.length;

                for(var i=0;i<$scope.lesson.subjectsTaught.length;i++)
                    $scope.subjectsTaught.push($scope.lesson.subjectsTaught[i]);

                $scope.getSyllabus();

			});

	};
	$scope.getLesson();

	$scope.getSyllabus = function () {
		var data = {};
		data.courseid = $scope.courseId;
		server.requestPhp(data, "GetSyllabusSubjectsByCourseId").then(function (data) {
			$rootScope.$broadcast('setHeaderTitle', {
				title : $rootScope.dictionary.SyllabusText
			});
            $scope.syllabus=data;
            $scope.AddCustomSubjectsToSyllabus();
		});
	};

    $scope.customSubject={
        subject:null,
        subjectid:null,
        subjectinarabic:null,
        subsubjects:[],
        supersubjectid:"custom"
    };

    $scope.AddCustomSubjectsToSyllabus=function(){


        if($scope.customSubjectsLength>0)
        {
            for(var sub =0;sub<$scope.customSubjectsLength;sub++)
            {
                $rootScope.$broadcast('buttonState', {title :true});
                $scope.customSubject.subjectid = $scope.lesson.customSubjects[sub].subjectid.toString();
                $scope.customSubject.subject = $scope.lesson.customSubjects[sub].subject;
                $scope.syllabus.push($scope.customSubject);
                $scope.subjectsTaught.push($scope.customSubject.subjectid);
                $scope.customSubjects.push($scope.customSubject);
                $scope.customSubject = {
                    subject: null,
                    subjectid: null,
                    subjectinarabic: null,
                    subsubjects: [],
                    supersubjectid: "custom"
                };
			}
        }
        else{
            $rootScope.$broadcast('buttonState', {title :false});
        }
    }



	
	$scope.selectSubjectsToBeTaught = function () {
		$timeout(function () {
			$scope.showSubjectSelectionPopup = true;
		}, 0);
	};
	
	$scope.toggleSubjectSelection = function (subjectid)
	{
		if($scope.subjectsTaught.indexOf(subjectid)==-1)
		{
			$scope.subjectsTaught.push(subjectid);
            for(var i=0;i<$scope.lesson.customSubjects.length;i++) {
                if ($scope.lesson.customSubjects[i].subjectid == subjectid) {
                    $scope.customSubjects.push($scope.lesson.customSubjects[i]);
                }
            }
		}
		else
		{
			$scope.subjectsTaught.splice($scope.subjectsTaught.indexOf(subjectid), 1);
			for(var i=0;i<$scope.customSubjects.length;i++) {
                if ($scope.customSubjects[i].subjectid == subjectid) {
                    $scope.customSubjects.splice(i, 1);
                }
            }
		}
        //if $scope.subjectsTaught eq 0 then disables button
        if($scope.subjectsTaught.length ==0){
            $rootScope.$broadcast('buttonState', {title :true});
        }
        else {
            $rootScope.$broadcast('buttonState', {title :false});
        }
	}

    $scope.SyllabusSubjectIds=[];

    $scope.GetSyllabusSubjectIds=function () {
        var data = {};
        data.courseid = $scope.courseId;
        server.requestPhp(data, "GetSubjectsByCourseIdNotInTree").then(function (data) {
            if (data && !data.error) {
                $scope.SyllabusSubjectIds = data;
            }
        });
    };

    $scope.GetSyllabusSubjectIds();

    $scope.GetAllFixedSubjectsTaught=function(){

        $scope.lesson.subjectsTaught=[];
        if($scope.subjectsTaught.length!=0 && $scope.SyllabusSubjectIds.length!=0) {
            for (var i = 0; i < $scope.subjectsTaught.length; i++) {
                for(var j=0;j<$scope.SyllabusSubjectIds.length;j++)
                {
                    if($scope.subjectsTaught[i]==$scope.SyllabusSubjectIds[j].subjectid)
                        $scope.lesson.subjectsTaught.push($scope.SyllabusSubjectIds[j].subjectid);
                }
            }
        }
    };
        $scope.$on('nextButton', function (event, data) {

            var data = {};
            data.lessonid = $scope.lessonId;
            data.courseId = $scope.courseId;

            $scope.GetAllFixedSubjectsTaught();
            $scope.lesson.customSubjects = [];
            $scope.lesson.customSubjects = $scope.customSubjects;
            data.lesson = $scope.lesson;
            server.requestPhp(data, "UpdateSubjectsTaughtInLesson").then(function (data) {
                $state.transitionTo('attendanceApproval', {
                    courseId: $stateParams["courseId"],
                    lessonId: $stateParams["lessonId"]
                });
            });
        });

}]);
