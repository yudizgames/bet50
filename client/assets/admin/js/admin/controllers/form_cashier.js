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

        }
    }

});
