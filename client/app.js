'use strict';
var pemdas = angular.module('Pemdas',[
  // load your modules here
    "main", // starting with the main module
    "client",
    "cashier"
]);
pemdas.config(function($stateProvider,$urlRouterProvider,$locationProvider,$ocLazyLoadProvider,$localForageProvider,toastrConfig,$qProvider){
    /**
     * $qProvider add because in angularjs -v 1.5.9 and ui-router -v 0.2.18 Transmission error when state change
     * i user some whenre $state.go to $state.transitionTo
     */
    $qProvider.errorOnUnhandledRejections(false);
    $ocLazyLoadProvider.config({
        cssFilesInsertBefore:'ng_load_plugins_before'
    });

    $stateProvider.state('login',{
        url:'/',
        templateUrl:'templates/login.html',
        data : { pageTitle: 'Login',bodyClass:'login'},
        controller:'LoginCtrl',
        resolve: {
            depends: ['$ocLazyLoad',function($ocLazyLoad){
                return $ocLazyLoad.load({
                    name: 'main',
                    insertBefore: '#ng_load_plugins_before', // load the above css files before
                    files: [
                        'assets/admin/pages/css/login.css',
                        'assets/admin/js/loginctrl.js',
                    ]
                });
            }]
        }
    });

    $locationProvider.hashPrefix('');

    // To define only one db driver - Logout issue (Because WebSql and Indexdb both store data)
    $localForageProvider.config({
        driver      : localforage.INDEXEDDB, // Force WebSQL; same as using setDriver()
        name        : 'Pemdas',
        version     : 1.0,
        size        : 4980736, // Size of database, in bytes. WebSQL-only for now.
    });

    angular.extend(toastrConfig, {
        allowHtml: false,
        closeButton: false,
        closeHtml: '<button>&times;</button>',
        extendedTimeOut: 1000,
        timeOut: 3000,
        toastClass: 'toast',
        titleClass: 'toast-title'
    });
});
pemdas.run(function($state,$rootScope,$http,$localForage){
    $rootScope.$state = $state; // state to be accessed from view
    $rootScope.$on('$stateChangeStart',function(event,toState,fromState,fromParams,$localtion){
        var currentState = toState.name;
            if(currentState){
                $localForage.getItem('UserInfo').then(function(data){
                if(data != null){

                    if(data.vUserType == 'super_admin' && data.status == 200){

                        var notAllowed = ['login','admin','client.dashboard'];
                        if(notAllowed.indexOf(currentState) > -1){
                            $state.transitionTo('admin.dashboard');
                        }
                        $http.defaults.headers.common.Authorization = 'JWT '+data.token;
                        $(document).ajaxSend(function(event, jqXHR, ajaxOptions) {
                            jqXHR.setRequestHeader('Authorization',  'JWT '+data.token);
                        });
                    }
                    else if(data.vUserType == 'agent' && data.status == 200){

                        var notAllowed = ['login','admin','client','admin.dashboard'];
                        if(notAllowed.indexOf(currentState) > -1){
                            $state.transitionTo('client.dashboard');
                        }
                        $http.defaults.headers.common.Authorization = 'JWT '+data.token;
                        $(document).ajaxSend(function(event, jqXHR, ajaxOptions) {
                            jqXHR.setRequestHeader('Authorization',  'JWT '+data.token);
                        });
                    }else if(data.vUserType == 'cashier' && data.status == 200){

                        var notAllowed = ['login','admin','client','cashier','admin.dashboard'];
                        if(notAllowed.indexOf(currentState) > -1){
                            $state.transitionTo('cashier.dashboard');
                        }
                        $http.defaults.headers.common.Authorization = 'JWT '+data.token;
                        $(document).ajaxSend(function(event, jqXHR, ajaxOptions) {
                            jqXHR.setRequestHeader('Authorization',  'JWT '+data.token);
                        });
                    }
                    else{
                        $state.transitionTo("login");
                    }
                }else{
                    $state.transitionTo('login');
                }
            });
        }
    });
    $rootScope.$state = $state;


});
pemdas.controller('GlobalCtrl',function ($scope,$rootScope) {

    $rootScope.hideLoad = true;


});
pemdas.controller('AppCtrl', function ($scope) {

});
pemdas.directive('ngSpinnerBar', ['$rootScope',
    function ($rootScope) {
        return {
            link: function (scope, element, attrs) {
                // by defult hide the spinner bar
                // element.addClass('hide');

                // display the spinner bar whenever the route changes(the content part started loading)
                $rootScope.$on('$stateChangeStart', function() {
                    element.removeClass('hide'); // show spinner bar
                });

                // hide the spinner bar on rounte change success(after the content loaded)
                $rootScope.$on('$stateChangeSuccess', function() {
                    element.addClass('hide'); // hide spinner bar
                    $('body').removeClass('page-on-load'); // remove page loading indicator
                    Layout.setSidebarMenuActiveLink('match'); // activate selected link in the sidebar menu

                    // // auto scorll to page top
                    // setTimeout(function() {
                    //     Metronic.scrollTop(); // scroll to the top on content load
                    // }, $rootScope.settings.layout.pageAutoScrollOnLoad);
                });

                // handle errors
                $rootScope.$on('$stateNotFound', function() {
                    element.addClass('hide'); // hide spinner bar
                });


                // handle errors
                $rootScope.$on('$stateChangeError', function() {
                    element.addClass('hide'); // hide spinner bar
                });

                // count how many time requests were sent to the server
                // so when they all done the spinner will be removed
                scope.counterNetwork = 0;
                $rootScope.$on('$stateNetworkRequestStarted', function () {
                    scope.counterNetwork++;
                    element.removeClass('hide'); // show spinner bar
                    //  $('body').addClass('page-on-load');
                });

                $rootScope.$on('$stateNetworkRequestEnded', function () {
                    scope.counterNetwork--;
                    if (scope.counterNetwork <= 0) {
                        scope.counterNetwork = 0;
                        element.addClass('hide'); // show spinner bar
                        //  $('body').removeClass('page-on-load'); // remove page loading indicator
                    }
                });

            }
        };
    }
]);

