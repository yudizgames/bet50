angular.module('Pemdas').controller('LoginCtrl',function ($scope,$http,$localForage,$state,toastr) {
    $scope.doLogin = function (data) {
        console.log(data);
        console.log($scope.user);
        $http({
            method:'post',
            url:'/login',
            dataType:"json",
            data:{"vEmail":$scope.user.vEmail,"vPassword":$scope.user.vPassword},
        }).then(function(res){
            console.log(res);
            if(res.data.status === 200){
                $localForage.setItem('UserInfo',res.data).then(function(){
                    console.log(data);
                    $localForage.getItem('UserInfo').then(function(data){
                        console.log("Local Storage Call");
                        console.log(data);
                        if(data.vUserType=='super_admin'){
                            $state.transitionTo('admin.dashboard');
                        }else if(data.vUserType=='agent'){
                            $state.transitionTo('client.dashboard');
                        }else{
                            $state.transitionTo('cashier.dashboard');
                        }
                    });
                });
            }else{
                toastr.error('Your credentials are gone', 'Error');
            }
            console.log("Success call");
        },function(err){
            console.log("Error call");
        });
    }

    $scope.forgotPass = function(data){
	    $http({
	        method:'post',
            url:'/fpass',
            dataType:'json',
            data:{"vEmail":$scope.email}
        }).then(function (res) {
            if(res.data.status == 200){
                toastr.success('Otp send on your password.', 'Success');
                console.log("check mail");
            }else{
                toastr.error("User not exist, Check your mail.",'Error');
            }
        });
    }

});