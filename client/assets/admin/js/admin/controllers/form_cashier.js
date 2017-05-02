/**
 * Created by YudizAshish on 01/05/17.
 */
angular.module('main').controller('CashierFormCtrl',function ($scope,$rootScope,$state,$stateParams,$resource,$http,toastr){
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
        }else{

            $http({
                method:'post',
                url:'/getagent',
                dataType:'json'
            }).then(function(res){
                console.log(res);
                if(res.data.status ==200){
                    $scope.agent = res.data.agent;
                }
            },function(err){
                console.log(err);
            });
        }
    }


    $scope.submitUser = function(){
        let postData = {};
        var URL = "";
        if($scope.user.iUserId != null || $scope.user.iUserId != undefined){
            postData = {
                iUserId: $scope.user.iUserId,
                vFullName:$scope.user.vFullName,
                iAgentId:$scope.user.iAgentId
            }
            URL = "/update_cashier";

        }else{
            postData = {
                    iUserId:0,
                    vFullName:$scope.user.vFullName,
                    iAgentId:$scope.user.iAgentId,
                    vEmail:$scope.user.vEmail
            }
            URL = "/add_cashier";
        }
        $http({
            method:'post',
            url:URL,
            dataType:'json',
            data:postData
        }).then(function(res){
            if(res.data.status == 200){
                toastr.success(res.data.message,"Success");
                $state.go("admin.cashier");
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
