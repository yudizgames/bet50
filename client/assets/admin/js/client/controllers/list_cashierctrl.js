/**
 * Created by YudizAshish on 28/04/17.
 */
angular.module('client').controller('AgentCashierListCtrl',function ($scope,$rootScope,$resource,$http,$state,toastr,DTOptionsBuilder,DTColumnDefBuilder,DTColumnBuilder,$compile) {
    //Status Store for every user
    $scope.userStatus = [];
    //Status change event fire
    $scope.dtInstanceUser = {};
    listUser();
    $scope.onUserStatusChange = function(id,status){
        $rootScope.hideLoad = false;  //Loading Stop For Network Operation Start
        $http({
            method:'post',
            url:'/useroperation',
            data:{
                'id':id+"",
                'vOperation':'status',
                'eStatus':status
            }
        }).then(function(res){
            console.log($rootScope.hideLoad);
            $rootScope.hideLoad = true; //Loading Stop For Network Operation Success
            toastr.success(res.data.message,"Successs");
            console.log(res);
        },function(err){
            console.log($rootScope.hideLoad);
            $rootScope.hideLoad = true;  //Loading Stop For Network Operation Error
            console.log("error call");
            console.log(err);
        })
    }

    //User Operation event fire
    $scope.userOperation = function(iUserId,OperationType){
        var postData = {
            'id':iUserId+"",
            'vOperation':OperationType
        }
        if(OperationType == 'view'){
            $state.go('client.cashierdetails',{'id':iUserId});
        }else if(OperationType == 'delete'){
            $http({
                method:'post',
                url:'/useroperation',
                dataType:'json',
                data:postData
            }).then(function(res){
                toastr.success(res.data.message,"Successs");
                $scope.dtInstanceUser.reloadData();
            },function(err){
        });
        }else if(OperationType == 'edit'){

            $state.current.data.form_action = "Edit";
            $state.go('client.cashierform',{'id':iUserId,'action':'Edit'});
        }
    }
    /**
     * BEGIN Data Table Integration
     */
    function listUser(){
        $scope.dtColumns = [
            //here We will add .withOption('name','column_name') for send column name to the server
            //here we will add .newColumn('column_name','Title for column name')
            DTColumnBuilder.newColumn("iUserId", "Cashier ID").withOption('name', 'iUserId'),
            DTColumnBuilder.newColumn("vFullName", "Cashier Name").withOption('name', 'vFullName'),
            DTColumnBuilder.newColumn("vEmail", "Email").withOption('name', 'vEmail'),
            DTColumnBuilder.newColumn(null).withTitle('Status').notSortable().renderWith(actionsHtml),
            // DTColumnBuilder.newColumn("Status",'Status').withOption('name','Status').notSortable(),
            DTColumnBuilder.newColumn("vOperation",'Operation').withOption('name','vOperation').notSortable(),
            // DTColumnBuilder.newColumn('foo','foo').withOption('name', 'foo').notVisible()
            DTColumnBuilder.newColumn("vUserType", "User Type").withOption('name', 'vUserType').notVisible(),
        ];
        // $scope.dtColumnDefs = [
        //     DTColumnDefBuilder.newColumnDef(0).withOption('sContentPadding', 'mmm')
        // ];
        $scope.dtOptions = DTOptionsBuilder.newOptions().withOption('ajax', {
            dataSrc: "data",
            url: "/list_cashier_agent",
            type: 'POST',
            dataType:'json',
            data:function(d){
                $scope.userStatus = [];
            }
        }).withOption('processing', true) //for show progress bar
            .withOption('serverSide', true) // for server side processing
            .withPaginationType('full_numbers') // for get full pagination options // first / last / prev / next and page numbers
            .withDisplayLength(10) // Page size
            .withOption('aaSorting',[0,'desc'])
            .withDataProp('data.inner')
            .withOption('createdRow',function(nRow, aData, iDisplayIndex, iDisplayIndexFull){
                $compile(nRow)($scope);
            });
    }
    function actionsHtml(data, type, full, meta) {
        $scope.userStatus[data.iUserId] = data.eStatus;
        var temp = '<input bs-switch ng-model="userStatus['+data.iUserId+']" class="switch-small" type="checkbox" ng-true-value="&apos;y&apos;" ng-false-value="&apos;n&apos;" ng-change="onUserStatusChange('+data.iUserId+',userStatus['+data.iUserId+'])">';
        return temp;
    }
    /**
     * END Data Table Integration
     */

});
