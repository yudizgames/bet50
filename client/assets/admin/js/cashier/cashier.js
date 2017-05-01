'use strict';
var app = angular.module('cashier',['ui.router',
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
    $stateProvider.state('cashier',{
        url:'/cashier',
        templateUrl:'templates/cashier/cashier.html',
        data : {bodyClass:'page-header-fixed page-sidebar-closed-hide-logo page-sidebar-closed-hide-logo' },
        controller:'CashierCtrl',
        abstract:true,
        resolve:{
            depends:['$ocLazyLoad',function($ocLazyLoad){
                return $ocLazyLoad.load({
                    name:'main',
                    insertBefore: '#ng_load_plugins_before',
                    files:[
                        'assets/admin/js/cashier/controllers/cashierctrl.js'
                    ]
                });
            }]
        }
    })
    .state('cashier.dashboard',{
            url:'/dashboard',
            templateUrl:'templates/cashier/dashboard.html',
            data :{ pageTitle:'Dashboard',bodyClass:'page-header-fixed page-sidebar-closed-hide-logo page-sidebar-closed-hide-logo' },
            controller:'CashierDashboardCtrl',
            resolve:{
                depends:['$ocLazyLoad',function($ocLazyLoad){
                    console.log("Lazy Load Call");
                    return $ocLazyLoad.load({
                        name:'main',
                        insertBefore:'#ng_load_plugins_before',
                        files:[
                            'assets/admin/js/cashier/controllers/dashboardctrl.js'
                        ]
                    });
                }]
            }
    })
    .state('cashier.cpass',{
            url:'/cpass',
            templateUrl:'templates/admin/cpass.html',
            data :{ pageTitle:'Change Password',bodyClass:'page-header-fixed page-sidebar-closed-hide-logo page-sidebar-closed-hide-logo' },
            controller:'CashierChangePassCtrl',
            resolve:{
                depends:['$ocLazyLoad',function($ocLazyLoad){
                    console.log("Lazy Load Call");
                    return $ocLazyLoad.load({
                        name:'main',
                        insertBefore:'#ng_load_plugins_before',
                        files:[
                            'assets/admin/js/cashier/controllers/changepassctrl.js',
                        ]
                    });
                }]
            }
    });



});
