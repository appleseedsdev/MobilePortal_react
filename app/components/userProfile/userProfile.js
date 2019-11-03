apple.controller('userProfile', ['$scope', '$rootScope', '$state', '$timeout', 'server', '$filter', '$stateParams', 'Upload',
function($scope, $rootScope, $state, $timeout, server, $filter, $stateParams, Upload) {
	$scope.userId = $stateParams["userId"];
	//get user details
	//if you shouldn't get access to the details display some message
	$scope.genderList = [];
	$scope.cityList = [];
	$scope.religionList = [];
    $scope.NetaStudent=false;

    getCities();
	getGenders();
	getReligions();
	$scope.user = {
		email : '',
		pass : '',
		passcheck : '',
		firstname : '',
		lastname : '',
		phone : '',
		phone2 : '',
		tznumber : '',
		birthday : '',
		address : '',
		image : '',
		religionid : '',
		notes: ''
	};
    $scope.NetaStudentDetails={
        FatherName:null,
        MotherName:null
    };
	var prevUser = [];

	$scope.editing = false;

    $scope.choosePicSelected = false;

	getUser();

	function getUser() {
		var data = {};
		data.userId = $scope.userId;
		server.requestPhp(data, "GetUserProfileById").then(function(data) {
			if(!data||data.error == "access permission")
			{
				alert("אין לך גישה לצפייה בנתונים האלו");
			}
			if (data && !data.error) {
				$scope.user = data.profile;
				var title = $scope.user.userid==$rootScope.me.userid?$rootScope.dictionary.myProfile:$rootScope.dictionary.profileOf+" "+$scope.user.firstname+" "+$scope.user.lastname;
				$rootScope.$broadcast('setHeaderTitle', {
					title : title
				});
				if($scope.isMobile())
				{
					setContactLinks();
				}
			}
		});
	}


    var GetNetaStudentDetails = function () {
        var data ={};
        data.userid=$scope.userId;
        server.requestPhp(data, 'GetNetaStudentDetails').then(function (data) {
            if(data.length>0) {
                $scope.NetaStudent = true;
				$scope.NetaStudentDetails.FatherName=data[0].FatherName;
				$scope.NetaStudentDetails.MotherName=data[0].MotherName;
            }

        });
    }

    GetNetaStudentDetails();

	function setContactLinks() {
		var telLink = document.getElementById("contact-tel-link");
		if(telLink)
			telLink.href = "tel:"+$scope.user.phone;
		var smsLink = document.getElementById("contact-sms-link");
		if(smsLink)
			smsLink.href = "sms:"+$scope.user.phone;
	}

	function setUser() {
		var data = $scope.user;
		var arr = $scope.user.birthday.split(/[/\-.]/);
		data.birthday = arr[0]+"/"+arr[1]+"/"+arr[2];
		data.id=$stateParams["userId"];
		server.requestPhp(data, "UpdateUserProfile").then(function(data) {
			getUser();
		});
	}

	$scope.onImageSelect = function($files) {
		//$files: an array of files selected, each file has name, size, and type.
		for (var i = 0; $files && i < $files.length; i++) {
			$scope.imageUpload = true;
			var $file = $files[i];
			Upload.upload({
				url : $rootScope.phpDomain + 'datagate.php?type=uploadDoc&token=' + $rootScope.loginToken,
				file : $file,
				progress : function(e) {
				}
			}).then(function(data, status, headers, config) {
				// file is uploaded successfully
				if (data.data.fileUrl) {
					var imgurl = data.data.fileUrl;
					$scope.user.image = imgurl;
					updateProfilePic();
				} else if (data.data.error)
					alert(data.data.error);
				else
					alert("תקלה בהעלאת קובץ");
				$scope.imageUpload = false;
			});
		}
	};

	$scope.onFail = function(e) {
		console.log('fail' + e)
	}

	$scope.onSuccess = function(fileURI) {
	$scope.imageUpload = true;
	var win = function(data) {
		/*
		 * if (JSON.parse(data.response)) { var
		 * imgurl =
		 * JSON.parse(data.response).fileUrl;
		 */
		if (data.response) {
			var imgurl;
			if (!$scope.isIos) {
				var replaceBackslashes = data.response.replace(/\\\//g, "/");
				replaceBackslashes = JSON.parse(replaceBackslashes.substring(1,replaceBackslashes.length))
				// data.response=JSON.parse(data.response);
				imgurl = replaceBackslashes.fileUrl;
			} else {
				imgurl = JSON.parse(data.response).fileUrl;
			}
			$timeout(function() {
				$scope.user.image = imgurl;
				updateProfilePic();
			}, 0)
		}
		else if (JSON.parse(data.response).error)
			alert(JSON.parse(data.response).error);
		else
			alert("תקלה בהעלאת קובץ");
		$scope.imageUpload = false;
	}

	var fail = function(error) {
		console.log('error' + error)
	}

	var options = new FileUploadOptions();
	options.fileKey = "file";
	options.fileName = fileURI.substr(fileURI.lastIndexOf('/') + 1);
	options.mimeType = "image/jpeg";
	options.params = {}; // if we need to send
	//parameters to the
	//server request
	options.chunkedMode = false;
	var ft = new FileTransfer();
	//console.log(fileURI,encodeURI($rootScope.phpDomain+ 'datagate.php?type=uploadDoc&token='+ $rootScope.loginToken),win, fail, options);
	ft.upload(fileURI,encodeURI($rootScope.phpDomain+ 'datagate.php?type=uploadDoc&token='+ $rootScope.loginToken), win, fail, options);
	// $scope.onImageSelect(ft);
}

	$scope.openGallery = function() {
		navigator.camera.getPicture($scope.onSuccess, $scope.onFail,
						{
							quality : 100,
							sourceType : Camera.PictureSourceType.SAVEDPHOTOALBUM,
							correctOrientation : true
						});
	}

	$scope.captureImageBase64 = function(fileURI) {
	}
                                    
	function updateProfilePic () {
	var data = {};
		data.userId = $scope.userId;
		data.image = $scope.user.image;
		data.type = "post";
		server.requestPhp(data, "UpdateUserProfilePic").then(function(data) {
			if($rootScope.me.userid == $scope.userId)
			{
				$rootScope.me.image=$scope.user.image;
			}
		});
	$scope.choosePicSelected = false;

}

	function getGenders() {
		var data = {};
		data.type = "post";
		server.requestPhp(data, "GetGenders").then(function(data) {
			// console.log(data);
			if (data && !data.error) {
				$scope.genderList = data;
			}
		});
	}

	function getCities() {
		var data = {};
		data.type = "post";
		server.requestPhp(data, "GetCities").then(function(data) {
			if (data && !data.error) {
				$scope.cityList = data;
			}
		});
	}

	function getReligions() {
		var data = {};
		data.type = "post";
		server.requestPhp(data, "GetReligions").then(function(data) {
			if (data && !data.error) {
				for (var i = 0; i < data.length; i++)
					{
					if (data[i].IsShow)
					{
						$scope.religionList.push(data[i]);
					}
				}
			}
		});
	}

	$scope.getGenderById = function(id) {
		for (var i = 0; i < $scope.genderList.length; i++) {
			if ($scope.genderList[i].genderid == id)
				return $scope.genderList[i];
		}
		return [];
	};

	$scope.getCityById = function(id) {
		for (var i = 0; i < $scope.cityList.length; i++) {
			if ($scope.cityList[i].cityid == id)
				return $scope.cityList[i];
		}
		return [];
	};

	$scope.getReligionById = function(id) {
		for (var i = 0; i < $scope.religionList.length; i++) {
			if ($scope.religionList[i].religionid == id)
				return $scope.religionList[i];
		}
		return [];
	};

	$scope.setGender = function (genderid) {
		$scope.user.genderid = genderid;
	};

	$scope.setCity = function (cityid) {
		$scope.user.cityid = cityid;
	};

	$scope.setReligion = function (religionid) {
		$scope.user.religionid = religionid;
	};

	$scope.updateProfile = function() {
		setUser();
	};

	$scope.validateEmail = function() {
		var val = $scope.user.email;
		//checks for example@example.example, such that [example] doesn't contain a '@'
		return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
	};

	function validatePhoneNum(n) {
		if(n==null)
			return false;
		//strips the input string of all hyphens, parentheses, and white spaces
		var num = n.replace(/([-()\s])/g, '');
		//checks that the result is composed entirely of digits, and is between 9 and 11 chars long.
		return /^[0-9]{9,11}$/g.test(num);
	}

	$scope.validatePhone1 = function() {
		//checks that the first phone number is in a phone format
		return validatePhoneNum($scope.user.phone);
	};

	$scope.validatePhone2 = function() {
		//checks that the second phone number is in a phone format, or empty
		return validatePhoneNum($scope.user.phone2)||$scope.user.phone2==''||$scope.user.phone2==null;
	};

	$scope.validateId = function(id) {
		//checks that the input string is at least 8 chars long, and contains only digits
		return /^[0-9]{8,}$/g.test(id);
	};

	$scope.validateDate = function() {
		var arr = $scope.user.birthday.split(/[/\-.]/);
		if (arr.length == 3) {
			var d = parseInt(arr[0]);
			var m = parseInt(arr[1]);
			var y = parseInt(arr[2]);
			if ([1, 3, 5, 7, 8, 10, 12].indexOf(m) != -1) {
				if (d > 31)
					return false;
			} else if ([4, 6, 9, 11].indexOf(m) != -1) {
				if (d > 30)
					return false;
			} else if (m == 2) {
				if (y % 4 == 0 && (y % 25 != 0 || y % 400 == 0)) {
					if (d > 29) {
						return false;
					}
				} else if (d > 28) {
					return false;
				}
			} else {
				return false;
			}
			if (y > new Date().getFullYear() || y < 1900) {
				return false;
			}
			return true;
		}

		return false;
	};

	$scope.validateAddress = function() {
		return true;///^[0-9\u0590-\u05FFa-zA-Z\u0621-\u064A\s-'./\\]{2,}$/.test($scope.user.address);
	};

    $scope.validateName= function(n) {
        //checks that the string is made out only of Arabic, Hebrew, or English letters, plus white spaces and hyphens
        return /^[0-9\u0590-\u05FFa-zA-Z\u0621-\u064A\s-'./\\]{2,}$/g.test(n);
    }

	$scope.startEdit = function() {
		$scope.editing = true;
		prevUser = {
			image : $scope.user.image,
			firstname : $scope.user.firstname,
			lastname : $scope.user.lastname,
			phone : $scope.user.phone,
			phone2 : $scope.user.phone2,
			cityid : $scope.user.cityid,
			address : $scope.user.address,
			birthday : $scope.user.birthday,
			email : $scope.user.email,
			tznumber : $scope.user.tznumber,
			genderid : $scope.user.genderid,
			religionid : $scope.user.religionid,
			notes : $scope.user.notes
		};
	};

	$scope.cancelEdit = function() {
		$scope.editing = false;
		$scope.user = prevUser;
	};

    $scope.SaveNetaCredential  =function(){
        var data ={};
        data.userid=$rootScope['me'].userid;
        data.FatherName= $scope.NetaStudentDetails.FatherName;
        data.MotherName= $scope.NetaStudentDetails.MotherName;
        //console.log(data);
        server.requestPhp(data, 'UpdateNetaStudentDetails').then(function (data) {

        });
    }

	$scope.saveEdit = function() {
		if ($scope.validateAllFields()) {
			$scope.editing = false;
			setUser();
            $scope.SaveNetaCredential();
		} else {
			alert($rootScope.dictionary.checkFieldErrors);
		}
	};

	$scope.openNoteEditor = function () {
		$scope.editingNotes = true;
	}

	$scope.closeNoteEditor = function () {
		$scope.editingNotes = false;
	}

	$scope.$on('hideInnerPage', function(event, data) {
		if ($scope.editingNotes) {
			$scope.closeNoteEditor();
		}
		else {
			window.history.back();
		}
	});

	$scope.validateAllFields = function() {
		return $scope.validateAddress() && $scope.validateDate() && $scope.validateId($scope.user.tznumber) && $scope.validatePhone1() && $scope.validatePhone2() && $scope.validateName($scope.user.FatherName) ;
	};

	$scope.changePassword = function () {
		$state.transitionTo('changePassword');
	};

    $scope.openImageOptions = function() {
        $scope.choosePicSelected = true;
    };

    $scope.openCamera = function() {

         navigator.camera.getPicture($scope.onSuccess, $scope.onFail, {

                   quality: 50,sourceType: Camera.DestinationType.FILE_URI
         });
    };
    function onFail(message) {
        alert('Failed because: ' + message);
    }

    function openCamera(selection) {

        var srcType = Camera.PictureSourceType.CAMERA;
        var options = setOptions(srcType);
        var func = createNewFileEntry;

        navigator.camera.getPicture(function cameraSuccess(imageUri) {

            displayImage(imageUri);
            // You may choose to copy the picture, save it somewhere, or upload.
            func(imageUri);

        }, function cameraError(error) {
            console.debug("Unable to obtain picture: " + error, "app");

        }, options);
    }

    $scope.closePicSelected = function() {
         $scope.choosePicSelected = false;
    };
    
    $scope.isMobile = function() {
    	var mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        return mobile;
   };

}]);
