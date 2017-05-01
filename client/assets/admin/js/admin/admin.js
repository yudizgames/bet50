'use strict';
var app = angular.module('main',['ui.router',
    'ui.bootstrap',
    'ngAnimate',
    'oc.lazyLoad',
    'LocalForageModule',
	'toastr',
    'datatables',
    'ngResource',
    'frapontillo.bootstrap-switch',
    'btford.socket-io'
]);
app.config(function($stateProvider,$urlRouterProvider,$locationProvider,$ocLazyLoadProvider,$localForageProvider,toastrConfig,$qProvider){
    $urlRouterProvider.otherwise('/admin/dashboard');
    $stateProvider.state('admin',{
		url:'/admin',
		templateUrl:'templates/admin/admin.html',
		data : {bodyClass:'page-header-fixed page-sidebar-closed-hide-logo page-sidebar-closed-hide-logo' },
		controller:'AdminCtrl',
		abstract:true,
		resolve:{
			depends:['$ocLazyLoad',function($ocLazyLoad){
				return $ocLazyLoad.load({
					name:'main',
					insertBefore: '#ng_load_plugins_before',
					files:[
						'assets/admin/js/admin/controllers/adminctrl.js'
					]
				});
			}]
		}
	})
	.state('admin.dashboard',{
		url:'/dashboard',
		templateUrl:'templates/admin/dashboard.html',
		data :{ pageTitle:'Dashboard',bodyClass:'page-header-fixed page-sidebar-closed-hide-logo page-sidebar-closed-hide-logo' },
		controller:'DashboardCtrl',
		resolve:{
			depends:['$ocLazyLoad',function($ocLazyLoad){

				return $ocLazyLoad.load({
					name:'main',
                    insertBefore:'#ng_load_plugins_before',
					files:[
						'assets/admin/js/admin/controllers/dashboardctrl.js'
					]
				});
			}]
		}
	})
    .state('admin.cpass',{
            url:'/cpass',
            templateUrl:'templates/admin/cpass.html',
            data :{ pageTitle:'Change Password',bodyClass:'page-header-fixed page-sidebar-closed-hide-logo page-sidebar-closed-hide-logo' },
            controller:'ChangePassCtrl',
            resolve:{
                depends:['$ocLazyLoad',function($ocLazyLoad){

                    return $ocLazyLoad.load({
                        name:'main',
                        insertBefore:'#ng_load_plugins_before',
                        files:[
                            'assets/admin/js/admin/controllers/changepassctrl.js',
                        ]
                    });
            }]
    	}
    })
    .state('admin.sitesetting',{
        url:'/sitesetting',
        templateUrl:'templates/admin/sitesettings.html',
        data :{ pageTitle:'Change Password',bodyClass:'page-header-fixed page-sidebar-closed-hide-logo page-sidebar-closed-hide-logo' },
        controller:'SiteSettingsCtrl',
        resolve:{
            depends:['$ocLazyLoad',function($ocLazyLoad){

                return $ocLazyLoad.load({
                    name:'main',
                    insertBefore:'#ng_load_plugins_before',
                    files:[
                        'assets/admin/js/admin/controllers/sitesettingctrl.js',
                    ]
                });
            }]
        }
    })
    .state('admin.agent',{
            url:'/agent',
            templateUrl:'templates/admin/list_agent.html',
            data :{ pageTitle:'Agents list',bodyClass:'page-header-fixed page-sidebar-closed-hide-logo page-sidebar-closed-hide-logo' },
            controller:'AgentListCtrl',
            resolve:{
                depends:['$ocLazyLoad',function($ocLazyLoad){

                    return $ocLazyLoad.load({
                        name:'main',
                        insertBefore:'#ng_load_plugins_before',
                        files:[
                            'assets/admin/js/admin/controllers/list_agentctrl.js',
                        ]
                    });
                }]
            }
    })
    .state('admin.agentdetails',{
            url:'/agentdetails/:id',
            templateUrl:'templates/admin/details_agent.html',
            data :{ pageTitle:'User details',bodyClass:'page-header-fixed page-sidebar-closed-hide-logo page-sidebar-closed-hide-logo' },
            controller:'AgentDetailsCtrl',
            resolve:{
                depends:['$ocLazyLoad',function($ocLazyLoad){
                    console.log("Lazy Load Call");
                    return $ocLazyLoad.load({
                        name:'main',
                        insertBefore:'#ng_load_plugins_before',
                        files:[
                            'assets/admin/pages/css/profile.css',
                            'assets/admin/js/admin/controllers/details_agent.js',

                        ]
                    });
                }]
            }
    })
    .state('admin.agentform',{
            url:'/agentform',
            params:{
                id:null,
                action:null,
                data:null
            },
            templateUrl:'templates/admin/form_agent.html',
            data :{ pageTitle:'Agent Form',bodyClass:'page-header-fixed page-sidebar-closed-hide-logo page-sidebar-closed-hide-logo'},
            controller:'AgentFormCtrl',
            resolve:{
                depends:['$ocLazyLoad',function($ocLazyLoad){
                    console.log("Lazy Load Call");
                    return $ocLazyLoad.load({
                        name:'main',
                        insertBefore:'#ng_load_plugins_before',
                        files:[
                            'assets/admin/js/admin/controllers/form_agent.js',
                        ]
                    });
                }]
            }
    })
    .state('admin.cashier',{
            url:'/cashier',
            templateUrl:'templates/admin/list_cashier.html',
            data :{ pageTitle:'Cashier list',bodyClass:'page-header-fixed page-sidebar-closed-hide-logo page-sidebar-closed-hide-logo' },
            controller:'CashierListCtrl',
            resolve:{
                depends:['$ocLazyLoad',function($ocLazyLoad){

                    return $ocLazyLoad.load({
                        name:'main',
                        insertBefore:'#ng_load_plugins_before',
                        files:[
                            'assets/admin/js/admin/controllers/list_cashierctrl.js',
                        ]
                    });
                }]
            }
    })

    .state('admin.cashierdetails',{
            url:'/cashierdetails/:id',
            templateUrl:'templates/admin/details_cashier.html',
            data :{ pageTitle:'User details',bodyClass:'page-header-fixed page-sidebar-closed-hide-logo page-sidebar-closed-hide-logo' },
            controller:'CashierDetailsCtrl',
            resolve:{
                depends:['$ocLazyLoad',function($ocLazyLoad){
                    console.log("Lazy Load Call");
                    return $ocLazyLoad.load({
                        name:'main',
                        insertBefore:'#ng_load_plugins_before',
                        files:[
                            'assets/admin/pages/css/profile.css',
                            'assets/admin/js/admin/controllers/details_cashierctrl.js',

                        ]
                    });
                }]
            }
    })
    .state('admin.cashierform',{
        url:'/cashierform',
        params:{
            id:null,
            action:null,
            data:null
        },
        templateUrl:'templates/admin/form_cashier.html',
        data :{ pageTitle:'Cashier Form',bodyClass:'page-header-fixed page-sidebar-closed-hide-logo page-sidebar-closed-hide-logo'},
        controller:'CashierFormCtrl',
        resolve:{
            depends:['$ocLazyLoad',function($ocLazyLoad){
                console.log("Lazy Load Call");
                return $ocLazyLoad.load({
                    name:'main',
                    insertBefore:'#ng_load_plugins_before',
                    files:[
                        'assets/admin/js/admin/controllers/form_cashier.js',
                    ]
                });
            }]
        }
    })
});
app.run(function(){

});
app.controller('AppCtrl', function ($scope) {

});
app.directive('bootstrapSwitch', [
    function() {
        return {
            restrict: 'A',
            require: '?ngModel',
            link: function(scope, element, attrs, ngModel) {
                element.bootstrapSwitch();

                element.on('switchChange.bootstrapSwitch', function(event, state) {
                    if (ngModel) {
                        scope.$apply(function() {
                            ngModel.$setViewValue(state);
                        });
                    }
                });

                scope.$watch(attrs.ngModel, function(newValue, oldValue) {
                    if (newValue){

                        element.bootstrapSwitch('state', true, true);
                    } else {

                        element.bootstrapSwitch('state', false, true);
                    }
                });
            }
        };
    }
]);

app.directive('a',
    function() {
        return {
            restrict: 'E',
            link: function(scope, elem, attrs) {
                if (attrs.ngClick || attrs.href === '' || attrs.href === '#') {
                    elem.on('click', function(e) {
                        e.preventDefault(); // prevent link click for above criteria
                    });
                }
            }
        };
    });




