apple.controller('courses', ['$scope', '$stateParams', '$rootScope', '$state', '$timeout', 'server', function ($scope, $stateParams, $rootScope, $state, $timeout, server) {
    console.log($rootScope);
    console.log($rootScope.me.userid);
    $scope.$state = $state;
    $scope.showactive  =  true ;
    $scope.shownotactive  =  false ;
    $scope.dropdownclass = "dropdown-arrow" ;
    $scope.dropdownactivefullclass = "dropdown-arrow rotreg";
    $scope.dropdownnotactivefullclass = "dropdown-arrow rot";
    // $scope.displaySaveApprovalPopup = true;
    $scope.NetaStudent=false;
    $scope.FatherNameEmpty=false;
    $scope.MotherNameEmpty=false;
    $scope.NetaCredetials={
        FatherName:null,
        MotherName:null
    };


    $scope.CheckIfUserIsSet = function () {
        var data ={};
       // data.userid=$rootScope['me'].userid;
       // server.requestPhp(data, 'CheckIfUserIsSet').then(function (data) {
        server.requestPhp(data, 'GetNetaStudentDetails').then(function (data) {
           // if(data[0]["count(*)"]==1) {
            if( data.length>0 ) {
                $scope.NetaCredetials.FatherName=data[0].FatherName;
                $scope.NetaCredetials.MotherName=data[0].MotherName;

                if (data[0].FatherName == null || data[0].FatherName == "") {
                    $scope.NetaStudent = true;
                    $scope.FatherNameEmpty = true;
                }
                if (data[0].MotherName == null || data[0].MotherName=="")  {
                    $scope.NetaStudent = true;
                    $scope.MotherNameEmpty = true;
                }
            }
        });

    }

    if($rootScope.me.userid!=undefined)
        $scope.CheckIfUserIsSet();


    $scope.CloseNetaCredetialsPopUp = function () {
        $scope.NetaStudent = false;
    };

    $scope.SaveNetaCredential  =function(){

        var data ={};
        data.userid=$rootScope['me'].userid;
        data.FatherName= $scope.NetaCredetials.FatherName;
        data.MotherName= $scope.NetaCredetials.MotherName;
        server.requestPhp(data, 'UpdateNetaStudentDetails').then(function (data) {
            if(data==true) {
                $scope.NetaStudent = false;
                $scope.CloseNetaCredetialsPopUp();
                $scope.FatherNameEmpty=false;
                $scope.MotherNameEmpty=false;
            }
        });
    }
    $scope.validateName= function(n) {
        //checks that the string is made out only of Arabic, Hebrew, or English letters, plus white spaces and hyphens
        return /^[0-9\u0590-\u05FFa-zA-Z\u0621-\u064A\s-'./\\]{2,}$/g.test(n);
    }

    // $scope.validateId = function(n) {
    //     //checks that the input string is at least 8 chars long, and contains only digits
    //     return /^[0-9]{8,}$/g.test(n);
    // };


    $rootScope.$broadcast('setHeaderTitle', { title: $rootScope.dictionary.courses });
    $scope.enrollmentRoleNames = {
        1: $rootScope.dictionary.learningIn,
        2: $rootScope.dictionary.teachingIn
    };
    //get enrollment roles list
    $scope.enrollments = [];
    $scope.selectedRole = null;
    var GetMyEnrollments = function () {
        var data ={};
        //GetMyEnrollments
        server.requestPhp(data, 'GetMyEnrollments').then(function (data) {
            $scope.enrollments = data;
            //TODO - fix hardcoding of enrollmentroleid
            if(!$scope.selectedRole)
            {
                if($scope.enrollments&&$scope.enrollments[2])
                    $scope.selectedRole = 2;
                else
                    $scope.selectedRole = 1;
            }
        });
    }
    GetMyEnrollments();
    $scope.onReload=function(){
        GetMyEnrollments();
    }
    $scope.switchRole = function (roleid){
        $scope.selectedRole = roleid;
    }

    $scope.openAddCourse = function () {
        $scope.showEnrollWithCodeForm = true;
    }

    $scope.change = function () {
        if ($scope.courseEnrollmentCode != undefined && $scope.courseEnrollmentCode.length == 0) {
            $scope.invalidCode = true;
        }
        if (!$scope.courseEnrollmentCode.match(/^[0-9a-zA-Z]+$/) && !$scope.courseEnrollmentCode.match(/^\s*$/)) {
            $scope.invalidCode = true;
        }
        else {
            $scope.invalidCode = false;
        }

    }

    $scope.goToCoursePage = function (id) {
        $state.transitionTo('singleCourse', { courseId: id })
    }

    $scope.cancelAddCourse = function () {
        $scope.showEnrollWithCodeForm = false;
        $scope.enrollingError = null;
        $scope.courseEnrollmentCode = "";
        $scope.invalidCode = false;
    }
    $scope.confirmAddCourse = function () {
        var data = {}
        data.code = $scope.courseEnrollmentCode;
        server.requestPhp(data, "EnrollToCourseByCode").then(function (data) {
            //if the course added
            if (data && !data.error) {
                //hide the popup
                $scope.showEnrollWithCodeForm = false
                GetMyEnrollments();
            }
            else
            {
                $scope.enrollingError = data.error;
            }
        });
    }
    $scope.notIsActive = function(course){

        return  ( course.status == '0' ? true : false) ;



    }
    $scope.isActive = function(course){

        return  ( course.status == '1' ? true : false) ;



    }
    $scope.changeActivesShow = function() {



        $scope.showactive = !$scope.showactive;

        $scope.dropdownactivefullclass= $scope.dropdownclass ;

        $scope.showactive ?  $scope.dropdownactivefullclass += " rotreg" : $scope.dropdownactivefullclass += " rot" ;


    }
    $scope.changeNotActivesShow = function() {

        $scope.shownotactive = !$scope.shownotactive;

        $scope.dropdownnotactivefullclass= $scope.dropdownclass ;

        $scope.shownotactive ?  $scope.dropdownnotactivefullclass += " rotreg" : $scope.dropdownnotactivefullclass += " rot" ;

    }

}
])

