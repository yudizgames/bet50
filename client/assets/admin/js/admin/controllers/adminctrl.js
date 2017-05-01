angular.module('main').controller('AdminCtrl',function ($scope,$http,$localForage,$state,$rootScope) {
	$localForage.getItem('UserInfo').then(function (data) {
		$rootScope.vUserName = data.vUserName;
	});
	$scope.currentState = $state.current.name;
	$scope.logout = function(){
		$http({
			method:'post',
			url:'/logout',
			dataType:'json'
		}).then(function(res){
			if(res.data.status == 200){
				$localForage.clear('UserInfo').then(function(res){
					$state.transitionTo('login');
				});
			}
		});
	}
});