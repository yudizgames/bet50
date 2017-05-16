/**
 * Created by YudizAshish on 01/05/17.
 */
angular.module('client').controller('AgentCashierFormCtrl',function ($scope,$rootScope,$state,$stateParams,$resource,$http,toastr){
    console.log("Cashier Form Ctrl");
    $scope.form_action = $stateParams.action;
    loadForm();
    function loadForm(){
        if($stateParams.action == 'Edit'){
            var postData = {
                'id':$stateParams.id+'',
                'vOperation':'view'
            }
            $http({
                method:'post',
                url:'/useroperation',
                dataType:'json',
                data:postData
            }).then(function(res){
                console.log("Success call");
                console.log(res);
                $scope.user = res.data.result[0];
                $scope.agent = res.data.agent;
                console.log($scope.user);
            },function(err){
                console.log("Error");
                console.log(err);
            });
        }
    }


    $scope.submitUser = function(){
        console.log("Submit user call");
        let postData = {};
        var URL = "";
        if($scope.user.iUserId != null || $scope.user.iUserId != undefined){
            postData = {
                iUserId: $scope.user.iUserId,
                vFullName:$scope.user.vFullName,
                iMobile:$scope.user.iMobile
            }
            URL = "/update_cashier_agent";
        }else{
            postData = {
                    iUserId:0,
                    vFullName:$scope.user.vFullName,
                    vEmail:$scope.user.vEmail,
                    iMobile:$scope.user.iMobile
            }
            URL = "/add_cashier_agent";
        }
        console.log(postData);
        $http({
            method:'post',
            url:URL,
            dataType:'json',
            data:postData
        }).then(function(res){
            if(res.data.status == 200){
                toastr.success(res.data.message,"Success");
                $state.go("client.cashier");
            }else{
                toastr.error(res.data.message,"Error");
            }
            console.log(res);
        },function(err){
            toastr.error(res.data.message,"Error");
            console.log(err);
        });
        console.log(postData);
    }

});
