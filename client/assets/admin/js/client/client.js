'use strict';
var app = angular.module('client',['ui.router',
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
    $stateProvider.state('client',{
        url:'/agent',
        templateUrl:'templates/agent/agent.html',
        data : {bodyClass:'page-header-fixed page-sidebar-closed-hide-logo page-sidebar-closed-hide-logo' },
        controller:'ClientCtrl',
        abstract:true,
        resolve:{
            depends:['$ocLazyLoad',function($ocLazyLoad){
                return $ocLazyLoad.load({
                    name:'main',
                    insertBefore: '#ng_load_plugins_before',
                    files:[
                        'assets/admin/js/client/controllers/clientctrl.js'
                    ]
                });
            }]
        }
    })
    .state('client.dashboard',{
            url:'/dashboard',
            templateUrl:'templates/agent/dashboard.html',
            data :{ pageTitle:'Dashboard',bodyClass:'page-header-fixed page-sidebar-closed-hide-logo page-sidebar-closed-hide-logo' },
            controller:'ClientDashboardCtrl',
            resolve:{
                depends:['$ocLazyLoad',function($ocLazyLoad){
                    console.log("Lazy Load Call");
                    return $ocLazyLoad.load({
                        name:'main',
                        insertBefore:'#ng_load_plugins_before',
                        files:[
                            'assets/admin/js/client/controllers/dashboardctrl.js'
                        ]
                    });
                }]
            }
    })
    .state('client.cpass',{
            url:'/cpass',
            templateUrl:'templates/admin/cpass.html',
            data :{ pageTitle:'Change Password',bodyClass:'page-header-fixed page-sidebar-closed-hide-logo page-sidebar-closed-hide-logo' },
            controller:'AgentChangePassCtrl',
            resolve:{
                depends:['$ocLazyLoad',function($ocLazyLoad){
                    console.log("Lazy Load Call");
                    return $ocLazyLoad.load({
                        name:'main',
                        insertBefore:'#ng_load_plugins_before',
                        files:[
                            'assets/admin/js/client/controllers/changepassctrl.js',
                        ]
                    });
                }]
            }
    })
    .state('client.cashier',{
            url:'/cashier',
            templateUrl:'templates/agent/list_cashier.html',
            data :{ pageTitle:'Cashier list',bodyClass:'page-header-fixed page-sidebar-closed-hide-logo page-sidebar-closed-hide-logo' },
            controller:'AgentCashierListCtrl',
            resolve:{
                depends:['$ocLazyLoad',function($ocLazyLoad){

                    return $ocLazyLoad.load({
                        name:'main',
                        insertBefore:'#ng_load_plugins_before',
                        files:[
                            'assets/admin/js/client/controllers/list_cashierctrl.js',
                        ]
                    });
                }]
            }
    })
    .state('client.cashierdetails',{
            url:'/cashierdetails/:id',
            templateUrl:'templates/agent/details_cashier.html',
            data :{ pageTitle:'User details',bodyClass:'page-header-fixed page-sidebar-closed-hide-logo page-sidebar-closed-hide-logo' },
            controller:'AgentCashierDetailsCtrl',
            resolve:{
                depends:['$ocLazyLoad',function($ocLazyLoad){
                    console.log("Lazy Load Call");
                    return $ocLazyLoad.load({
                        name:'main',
                        insertBefore:'#ng_load_plugins_before',
                        files:[
                            'assets/admin/pages/css/profile.css',
                            'assets/admin/js/client/controllers/details_cashierctrl.js',

                        ]
                    });
                }]
            }
    })
    .state('client.cashierform',{
            url:'/cashierform',
            params:{
                id:null,
                action:null,
                data:null
            },
            templateUrl:'templates/agent/form_cashier.html',
            data :{ pageTitle:'Cashier Form',bodyClass:'page-header-fixed page-sidebar-closed-hide-logo page-sidebar-closed-hide-logo'},
            controller:'AgentCashierFormCtrl',
            resolve:{
                depends:['$ocLazyLoad',function($ocLazyLoad){
                    console.log("Lazy Load Call");
                    return $ocLazyLoad.load({
                        name:'main',
                        insertBefore:'#ng_load_plugins_before',
                        files:[
                            'assets/admin/js/client/controllers/form_cashier.js',
                        ]
                    });
                }]
            }
    })
    .state('client.credit',{
            url:'/credit',
            templateUrl:'templates/agent/list_credit.html',
            data :{ pageTitle:'Credit Management',bodyClass:'page-header-fixed page-sidebar-closed-hide-logo page-sidebar-closed-hide-logo' },
            controller:'CreditListCtrl',
            resolve:{
                depends:['$ocLazyLoad',function($ocLazyLoad){

                    return $ocLazyLoad.load({
                        name:'main',
                        insertBefore:'#ng_load_plugins_before',
                        files:[
                            'assets/admin/js/client/controllers/list_creditctrl.js',
                        ]
                    });
                }]
            }
    })
    .state('client.transaction',{
            url:'/transaction',
            templateUrl:'templates/agent/list_transaction.html',
            data :{ pageTitle:'Transaction Management',bodyClass:'page-header-fixed page-sidebar-closed-hide-logo page-sidebar-closed-hide-logo' },
            controller:'TransactionCtrl',
            resolve:{
                depends:['$ocLazyLoad',function($ocLazyLoad){
                    return $ocLazyLoad.load({
                        name:'main',
                        insertBefore:'#ng_load_plugins_before',
                        files:[
                            'assets/admin/js/client/controllers/list_transactionctrl.js',
                        ]
                    });
                }]
            }
    })
    .state('client.commission',{
            url:'/commission',
            templateUrl:'templates/agent/list_commission.html',
            data :{ pageTitle:'Commission Management',bodyClass:'page-header-fixed page-sidebar-closed-hide-logo page-sidebar-closed-hide-logo' },
            controller:'CommissionCtrl',
            resolve:{
                depends:['$ocLazyLoad',function($ocLazyLoad){
                    return $ocLazyLoad.load({
                        name:'main',
                        insertBefore:'#ng_load_plugins_before',
                        files:[
                            'assets/admin/js/client/controllers/list_commissionctrl.js',
                        ]
                    });
                }]
            }
    });



});
