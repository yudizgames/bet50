/**
 * Created by YudizAshish on 01/05/17.
 */
angular.module('main').controller('AgentDetailsCtrl',function($scope,$http,$stateParams){
    console.log("Agent Details Controller call");
    console.log("Users Details controller call");
    console.log($stateParams.id);
    var postData = {
        'id':$stateParams.id,
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
        $scope.profile = res.data.result[0];
        console.log($scope.profile);
    },function(err){
        console.log("Error");
        console.log(err);
    });
});