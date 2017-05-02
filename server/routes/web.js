var formidable = require("formidable");
var queries = require("../modules/queries");
var md5 = require("md5");
var path = require('path');
var validator = require("validator");
var jwt = require('jsonwebtoken'); // use for jwt.sign
var passport = require("passport");
var randomstring = require("randomstring");
var JWTStrategy = require('../../config/passport-auth'); //passport-jwt Authorization Strategy
var async = require("async");

passport.use(JWTStrategy);
module.exports = function (app,cli,mail) {

    app.get('/', function (req, res) {
            console.log("Login Page request");
            console.log("lgoin page call"+req);
            res.render('index');
    });

    app.post('/login',function(req,res){
                var body = req.body;
                var $status = 404;
                var $message = "Something webnt wrong";
                queries.getUser(body,function(err,rows){
                    if(err)throw err
                    if(rows.length === 1){
                        var hash = md5(rows[0].iUserId + Math.random() + Date.now());
                        var payload = { 'token':hash,'device':'DeskTop','vUserType':rows[0].vUserType};
                        var token = jwt.sign(payload,"pemdas");
                        queries.setTocket({
                            'token': hash,
                            'iUserId': rows[0].iUserId,
                            'eDeviceType': 'Desktop'
                        },function (err,response) {
                            if (err) throw err;
                            cli.blue("After Insert");
                            $status = 200;
                            $message = "Success";
                            res.json({
                                'status':$status,'message':$message,'token':token,'vUserType':rows[0].vUserType,'vUserName':rows[0].vFullName,'iUserId':rows[0].iUserId
                            })
                        })
                    }else{
                        $status = 404;
                        $message = 'User not exists';
                        res.json({
                            'status': $status,
                            'message': $message
                        });
                    }
                });
            });

    app.post('/logout',passport.authenticate('jwt',{session:false}),function (req,res) {
                if(req.user.length > 0 ){
                    queries.logOut({
                        "iDeviceId":req.user[0].iDeviceId
                    },function (error,rows) {
		                cli.blue("Call for success");
                        res.json({
                            'status':200,
                            'message':'Logout Successfully'
                        });
                    });
                }else{
                        res.json({
                            "status":200,
                            'message':"Unauthorized"
                        })
                }
        })

    app.post('/cpass',passport.authenticate('jwt',{session:false}),function(req,res){

                if(req.user.length > 0 ){
                        var postData = {
                            "iUserId":req.user[0].iUserId,
                            "vNewPassword":req.body.vNewPassword,
                            "vOldPassword":req.body.vOldPassword
                        }
                        queries.checkPassword(postData,function(error,user){

                            if(user.length > 0){ cli.green("Password Check");
                                queries.changePassword(postData,function(error,rows){
                                    cli.green("Password Change");
                                    if (error) throw error;
                                    res.json({
                                        'status':200,
                                       'message':'Password Change Successfully.'
                                    });
                                })
                            }else{
                                res.json({
                                    'status':400,
                                    'message': 'Old password does not match.'
                                })
                            }
                        })
                    }else{
                    res.json({
                       'status':404,
                       'message':'Unauthorized'
                    });
                }

    });

    app.post('/fpass',function(req,res){
                if(validator.isEmail(req.body.vEmail) && !validator.isEmpty(req.body.vEmail)){
                    queries.checkEmail(req.body,function(err,resultOne){
                        cli.green("Check This one");
                        if(resultOne.length){
                            var pass = randomstring.generate(6);
                            var queryData = {
                                'vNewPassword':pass,
                                "vEmail":req.body.vEmail
                            }
                            queries.forgotPass(queryData,function(err,resultTwo){
                                if(err) throw  err;
                                var mailOptions = {
                                    from: '"Bet50" <info@bet50.com>', // sender address
                                    to: req.body.vEmail, // list of receivers
                                    subject: 'Hello '+ resultOne[0].vFullName, // Subject line
                                    text: 'One time password for reset password : ' + pass // plaintext body
                                };
                                mail.sendMail(mailOptions,function(err,info){
                                    if(err){
                                        cli.red("Mail not send");
                                        console.log(err);
                                    }
                                });
                                res.status(200).json({
                                    'status':200,
                                    'message':"Otp has been send Successfully, check mail"
                                })
                            })
                        }else{
                            res.json({
                                "status":404,
                                "message":'User not active'
                            });
                        }

                    });
                }else{
                    res.json({
                        "status":404,
                        "message":"Please fill all required value"
                    })
                }
    });

    app.post('/settings',passport.authenticate('jwt',{session:false}),function(req,res){
                cli.blue("Setting call");
                if(req.user.length > 0){
                    queries.getSettings(req,function(error,rows){
                        res.json({
                            'status':200,
                            'message':'Success',
                            'result':rows
                        })
                    });
                }else{
                    res.json({
                        "status":404,
                        "message":'User not active'
                    })
                }
    });

    app.post('/settingspost',passport.authenticate('jwt',{session:false}),function(req,res){
                cli.blue("Setting call");
                if(req.user.length > 0){
                    cli.blue("PAth");
                    var form = new formidable.IncomingForm();
                    // specify that we want to allow the user to upload multiple files in a single request
                    //form.multiples = true;
                    // store all uploads in the /uploads directory
                    form.uploadDir = path.join(__dirname, '/uploads');
                    // every time a file has been uploaded successfully,
                    // rename it to it's orignal name
                    form.on('file', function(field, file) {
                        var filename = md5(new Date().getTime() + file.name + req.user[0].iUserId) + path.extname(file.name);
                        fs.rename(file.path, path.join(form.uploadDir, filename));
                        services.saveSettings([filename, field], function(err, row) {});

                    });
                    form.on('field', function(field, value) {
                        queries.saveSettings([value, field], function(err, row) {
                            if (err) throw err;
                        });
                    });

                    // log any errors that occur
                    form.on('error', function(err) {
                        //console.log('An error has occured: \n' + err);
                        res.status(404).json({
                            'message': err
                        });
                    });

                    // once all the files have been uploaded, send a response to the client
                    form.on('end', function() {
                        res.status(200).json({
                            'message': 'Settings has been updated successfully'
                        });
                    });

                    // parse the incoming request containing the form data
                    form.parse(req);

                }else{
                    res.json({
                        "status":404,
                        "message":'User not active'
                    })
                }
        });

    //User Module

    app.post('/user_list',passport.authenticate('jwt',{session:false}),function(req,res){


                cli.yellow(JSON.stringify(req.user));

                queries.getUserById({"id":req.user[0].iUserId},function(error,users){
                    var obj = {
                        'vUserName': req.body.search.value, //Search Apply for default search text box
                        'vEmail': req.body.search.value,//Search Apply for default search text box
                        'iUserId':req.user[0].iUserId,
                        'vUserType':users[0].vUserType
                    };

                    if(users[0].vUserType == 'client' )
                    {

                        queries.ls_user_count(obj, function(err, record) {
                            var iTotalRecords = parseInt(record[0].iTotalRecords);
                            var iDisplayLength = parseInt(req.body.length);
                            iDisplayLength = iDisplayLength < 0 ? iTotalRecords : iDisplayLength;
                            var iDisplayStart = parseInt(req.body.start);
                            var end = iDisplayStart + iDisplayLength;
                            end = end > iTotalRecords ? iTotalRecords : end;
                            var obj = {
                                'limit': end,
                                'offset': iDisplayStart,
                                'vFullName': req.body.search.value,
                                'vEmail': req.body.search.value,
                                'sort':getSorting(req.body),
                                'iParentId':req.user[0].iUserId,
                            };
                            queries.ls_user_select(obj, function(err, users) {
                                if (err) return err;
                                var i = 0;
                                var records = {};
                                records['draw'] = req.body.draw;
                                records['recordsTotal'] = iTotalRecords;
                                records['recordsFiltered'] = iTotalRecords;
                                records['data'] = [];
                                for (var key in users) {
                                    // var status = '<input bs-switch ng-model="'+users[i].eStatus+'" value="'+users[i].eStatus+'" class="switch-small" type="checkbox" ng-true-value="&apos;y&apos;" ng-false-value="&apos;n&apos;" ng-change="onUserStatusChange(&apos;'+users[i].eStatus+'&apos;,'+users[i].iUserId+')">';
                                    var operation = '<button ng-click="userOperation('+users[i].iUserId+',&quot;view&quot;)" title="View"  class="btn btn-success btn-xs">View</button>';
                                    operation+= '<button ng-click="userOperation('+users[i].iUserId+',&quot;edit&quot;)" title="Edit"  class="btn btn-warning  btn-xs">Edit</button>';
                                    operation+= '<button ng-click="userOperation('+users[i].iUserId+',&quot;delete&quot;)" title="Delete"  class="btn btn-danger  btn-xs">Delete</button>';
                                    records['data'][i] = {"iUserId":users[i].iUserId,"vFullName":users[i].vFullName,"vEmail":users[i].vEmail,"eStatus":users[i].eStatus,"vOperation":operation,"vUserType":users[i].vUserType};
                                    i++;
                                }
                                res.json(records);
                            });
                        });



                    }else{

                        queries.ls_user_count(obj, function(err, record) {
                            var iTotalRecords = parseInt(record[0].iTotalRecords);
                            var iDisplayLength = parseInt(req.body.length);
                            iDisplayLength = iDisplayLength < 0 ? iTotalRecords : iDisplayLength;
                            var iDisplayStart = parseInt(req.body.start);
                            var end = iDisplayStart + iDisplayLength;
                            end = end > iTotalRecords ? iTotalRecords : end;
                            var obj = {
                                'limit': end,
                                'offset': iDisplayStart,
                                'vFullName': req.body.search.value,
                                'vEmail': req.body.search.value,
                                'sort':getSorting(req.body),
                                'vUserType':users[0].vUserType
                            };
                            queries.ls_user_select(obj, function(err, users) {
                                if (err) return err;
                                var i = 0;
                                var records = {};
                                records['draw'] = req.body.draw;
                                records['recordsTotal'] = iTotalRecords;
                                records['recordsFiltered'] = iTotalRecords;
                                records['data'] = [];
                                for (var key in users) {
                                    // var status = '<input bs-switch ng-model="'+users[i].eStatus+'" value="'+users[i].eStatus+'" class="switch-small" type="checkbox" ng-true-value="&apos;y&apos;" ng-false-value="&apos;n&apos;" ng-change="onUserStatusChange(&apos;'+users[i].eStatus+'&apos;,'+users[i].iUserId+')">';
                                    var operation = '<button ng-click="userOperation('+users[i].iUserId+',&quot;view&quot;)" title="View"  class="btn btn-success btn-xs">View</button>';
                                    operation+= '<button ng-click="userOperation('+users[i].iUserId+',&quot;edit&quot;)" title="Edit"  class="btn btn-warning  btn-xs">Edit</button>';
                                    operation+= '<button ng-click="userOperation('+users[i].iUserId+',&quot;delete&quot;)" title="Delete"  class="btn btn-danger  btn-xs">Delete</button>';
                                    records['data'][i] = {"iUserId":users[i].iUserId,"vFullName":users[i].vFullName,"vEmail":users[i].vEmail,"eStatus":users[i].eStatus,"vOperation":operation,"vUserType":users[i].vUserType};
                                    i++;
                                }
                                res.json(records);
                            });
                        });



                    }


                });


            });
    /**
     *  When Client Add New User
     */

    app.post('/useradd',passport.authenticate('jwt',{session:false}),function (req,res) {
                if(req.user.length > 0){
                    cli.blue("Check Email");
                    cli.blue(validator.isEmail(req.body.vEmail));
                    if(!validator.isEmpty(req.body.vFullName) && validator.isEmail(req.body.vEmail)){
                        checkUser(req.body.vEmail,function(error,isActive){
                            if(error) throw error;
                            if(isActive.length > 0){
                                res.json({
                                    "status":404,
                                    "message":"User already available"
                                });
                            }else{
                                var vPassword = randomstring.generate(6);
                                    /**
                                     * Add Agent
                                     */
                                    queries.addUser({"vUserType":'agent',"vFullName":req.body.vFullName,"vUserName":req.body.vEmail,"vEmail":req.body.vEmail,"vPassword":vPassword},function(err,rows){
                                        if(err) throw err;
                                        if(rows.affectedRows > 0){
                                            //Send Mail
                                            var mailOptions = {
                                                        from: '"Bet50" <info@bet50.com>', // sender address
                                                        to: req.body.vEmail, // list of receivers
                                                        subject: 'Hello '+ req.body.vFullName, // Subject line
                                                        text: 'One time password  : ' + vPassword // plaintext body
                                            };
                                            mail.sendMail(mailOptions,function(err,info){
                                                        if(err){
                                                            cli.red("Mail not send");
                                                            console.log(err);
                                                        }else{
                                                            cli.yellow("Mail send");
                                                        }
                                            });
                                            //Send mail end
                                            res.json({
                                                        "status":200,
                                                        "message":"User Insert Successfully."
                                            });

                                        }else{
                                            res.json({
                                                "status":400,
                                                "message":"Something went wrong"
                                            });
                                        }
                                    });

                                }
                        });
                    }else{
                        res.json({
                            "status":404,
                            "message":"Please fill all required value"
                        });
                    }
                }else{
                    res.json({
                        "status":404,
                        "message":'User not active'
                    })
                }

            });

    app.post('/useroperation',passport.authenticate('jwt',{session:false}),function(req,res){
            if(!validator.isEmpty(req.body.id) && !validator.isEmpty(req.body.vOperation)){
            cli.blue("inside");
            console.log("Inside");
            if(req.user.length > 0 ){
                if(req.body.vOperation == 'view'){
                    cli.blue("view call");
                    queries.getUserById({'id':req.body.id},function(error,rows){
                        console.log(rows);
                        if(rows[0].vUserType == "cashier"){
                            queries.get_cashier_by_id({'iUserId':req.body.id},function(errOne,resOne){
                                queries.get_all_agent(function(errTwo,resTwo){
                                    if(resOne.length > 0){
                                        res.json({
                                            'status':200,
                                            'message':'success',
                                            'result':resOne,
                                            'agent':resTwo
                                        });
                                    }else{
                                        res.json({
                                            'status':404,
                                            'message':'User Not Found',
                                        })
                                    }
                                });
                            });
                        }
                        else{
                            if(rows.length > 0){
                                res.json({
                                    'status':200,
                                    'message':'success',
                                    'result':rows
                                });
                            }else{
                                res.json({
                                    'status':404,
                                    'message':'User Not Found',
                                })
                            }
                        }


                    });
                }else if(req.body.vOperation == 'edit'){
                    if(!validator.isEmpty(req.body.vFullName)){
                        cli.green("Edit call");
                        cli.red(req.body.id);
                        queries.updateUserById({'id':req.body.id,'vFullName':req.body.vFullName},function(err,rows){
                            if(err) throw err;
                            res.status(200).json({
                                'message':'User update successfully'
                            });
                        });
                    }else{
                        res.json({
                            "status":404,
                            "message":"Please fill all required value"
                        });
                    }
                }else if(req.body.vOperation == 'delete'){
                    queries.deleteUserById({'id':req.body.id},function(error,rows){
                        if(error) throw error;
                        res.json({
                            'status':200,
                            'message':'User deleted successfully.'
                        });
                    });
                }else if(req.body.vOperation == 'status'){
                    console.log("status call");
                    cli.red("Status call");
                    if(!validator.isEmpty(req.body.eStatus+'')){
                        cli.blue("Do more stuff when delete operation perform");
                        queries.changeUserStatusById({'id':req.body.id,'eStatus':req.body.eStatus},function(error,rows){
                            if(error) throw error;
                            res.json({
                                'status':200,
                                'message':'User status change successfully'
                            });
                        });
                    }else{
                        res.json({
                            "status":404,
                            "message":"Please fill all required value"
                        })
                    }
                } else{
                    res.json({
                        "status":404,
                        "message":"Please fill all required value"
                    })
                }
            }else{
                res.json({
                    "status":404,
                    "message":"Something webnt wrong"
                })
            }

        }else{

            res.json({
                "status":404,
                "message":"Please fill all required value"
            })

        }


            });

    // User Module End

    //Agent Module

    app.post('/list_agent',function(req,res){
        cli.blue(JSON.stringify(req.body));
        var obj = {
            'vUserName': req.body.search.value, //Search Apply for default search text box
            'vEmail': req.body.search.value //Search Apply for default search text box
        };
        queries.ls_agent_count(obj, function(err, record) {
            var iTotalRecords = parseInt(record[0].iTotalRecords);
            var iDisplayLength = parseInt(req.body.length);
            iDisplayLength = iDisplayLength < 0 ? iTotalRecords : iDisplayLength;
            var iDisplayStart = parseInt(req.body.start);
            var end = iDisplayStart + iDisplayLength;
            end = end > iTotalRecords ? iTotalRecords : end;
            var obj = {
                'limit': end,
                'offset': iDisplayStart,
                'vFullName': req.body.search.value,
                'vEmail': req.body.search.value,
                'sort':getSorting(req.body)
            };
            queries.ls_agent_select(obj, function(err, users) {
                if (err) return err;
                var i = 0;
                var records = {};
                records['draw'] = req.body.draw;
                records['recordsTotal'] = iTotalRecords;
                records['recordsFiltered'] = iTotalRecords;
                records['data'] = [];
                for (var key in users) {
                    // var status = '<input bs-switch ng-model="'+users[i].eStatus+'" value="'+users[i].eStatus+'" class="switch-small" type="checkbox" ng-true-value="&apos;y&apos;" ng-false-value="&apos;n&apos;" ng-change="onUserStatusChange(&apos;'+users[i].eStatus+'&apos;,'+users[i].iUserId+')">';
                    var operation = '<button ng-click="userOperation('+users[i].iUserId+',&quot;view&quot;)" title="View"  class="btn btn-success btn-xs">View</button>';
                    operation+= '<button ng-click="userOperation('+users[i].iUserId+',&quot;edit&quot;)" title="Edit"  class="btn btn-warning  btn-xs">Edit</button>';
                    operation+= '<button ng-click="userOperation('+users[i].iUserId+',&quot;delete&quot;)" title="Delete"  class="btn btn-danger  btn-xs">Delete</button>';
                    records['data'][i] = {"iUserId":users[i].iUserId,"vFullName":users[i].vFullName,"vEmail":users[i].vEmail,"eStatus":users[i].eStatus,"vOperation":operation,"vUserType":users[i].vUserType};
                    i++;
                }
                res.json(records);
            });
        });
    });

    app.post('/clientadd',passport.authenticate('jwt',{session:false}),function (req,res) {
        if(req.user.length > 0){
            cli.blue("Check Email");
            cli.blue(validator.isEmail(req.body.vEmail));
            if(!validator.isEmpty(req.body.vFullName) && validator.isEmail(req.body.vEmail)){
                checkUser(req.body.vEmail,function(error,isActive){
                    if(error) throw error;
                    if(isActive.length > 0){
                        res.json({
                            "status":404,
                            "message":"User already available"
                        });
                    }else{
                        var vPassword = randomstring.generate(6);
                        queries.addUser({"vUserType":"client","vFullName":req.body.vFullName,"vUserName":req.body.vEmail,"vEmail":req.body.vEmail,"vPassword":vPassword},function(err,rows){
                            if(err) throw err;
                            if(rows.affectedRows > 0){
                                queries.addParent({"iUserId":rows.insertId},function(errors,row){
                                    if(row.affectedRows > 0){

                                        //Send Mail
                                        var mailOptions = {
                                            from: '"Pemdas" <info@pemdas.com>', // sender address
                                            to: req.body.vEmail, // list of receivers
                                            subject: 'Hello '+ req.body.vFullName, // Subject line
                                            text: 'One time password  : ' + vPassword // plaintext body
                                        };
                                        mail.sendMail(mailOptions,function(err,info){
                                            if(err){
                                                cli.red("Mail not send");
                                                console.log(err);
                                            }else{
                                                cli.yellow("Mail send");
                                            }
                                        });
                                        //Send mail end


                                        res.json({
                                            "status":200,
                                            "message":"User Insert Successfully."
                                        });

                                    }
                                    else{
                                        res.json({
                                            "status":400,
                                            "message":"Something went wrong"
                                        });
                                    }

                                });
                            }else{
                                res.json({
                                    "status":400,
                                    "message":"Something went wrong"
                                });
                            }
                        });
                    }
                });
            }else{
                res.json({
                    "status":404,
                    "message":"Please fill all required value"
                });
            }
        }else{
            res.json({
                "status":404,
                "message":'User not active'
            })
        }

    });

    app.post('/clientoperation',passport.authenticate('jwt',{session:false}),function(req,res){
        if(!validator.isEmpty(req.body.id) && !validator.isEmpty(req.body.vOperation)){
            cli.blue("inside");
            console.log("Inside");
            if(req.user.length > 0 ){

                if(req.body.vOperation == 'view'){
                    cli.blue("view call");
                    queries.getUserById({'id':req.body.id},function(e,users){
                        if(users.length > 0){
                            var temp = {};
                            var child = [];
                            temp.ParentName = users[0].vFullName;
                            temp.ParentEmail = users[0].vEmail;
                            temp.ParentUserName = users[0].vUserName;
                            queries.get_child_by_client_id({'id':req.body.id},function(error,rows){
                                if(rows.length > 0 ){

                                    for(var i=0; i< rows.length; i++){
                                        child.push({
                                            "ChildName":rows[i].ChildName,
                                            "ChildEmail":rows[i].ChildEmail,
                                            "ChildUserName":rows[i].ChildUserName
                                        });
                                    }

                                }
                                temp.child = child;
                                res.json({
                                    'status':200,
                                    'message':'success',
                                    'result':temp
                                });
                            });
                        }else{
                            res.json({
                                'status':404,
                                'message':'User Not Found',
                            })
                        }
                    });

                }else if(req.body.vOperation == 'edit'){
                    if(!validator.isEmpty(req.body.vFullName)){
                        cli.green("Edit call");
                        cli.red(req.body.id);
                        queries.updateUserById({'id':req.body.id,'vFullName':req.body.vFullName},function(err,rows){
                            if(err) throw err;
                            res.status(200).json({
                                'message':'User update successfully'
                            });
                        });
                    }else{
                        res.json({
                            "status":404,
                            "message":"Please fill all required value"
                        });
                    }
                }else if(req.body.vOperation == 'delete'){
                    queries.deleteUserById({'id':req.body.id},function(error,rows){
                        if(error) throw error;
                        res.json({
                            'status':200,
                            'message':'User deleted successfully.'
                        });
                    });
                }else if(req.body.vOperation == 'status'){
                    if(!validator.isEmpty(req.body.eStatus+'')){
                        queries.changeUserStatusById({'id':req.body.id,'eStatus':req.body.eStatus},function(error,rows){
                            if(error) throw error;
                            res.json({
                                'status':200,
                                'message':'User status change successfully'
                            });
                        });
                    }else{
                        res.json({
                            "status":404,
                            "message":"Please fill all required value"
                        })
                    }
                } else{
                    res.json({
                        "status":404,
                        "message":"Please fill all required value"
                    })
                }
            }else{
                res.json({
                    "status":404,
                    "message":"Something webnt wrong"
                })
            }

        }else{

            res.json({
                "status":404,
                "message":"Please fill all required value"
            })

        }

    });

    app.post('/getagent',passport.authenticate('jwt',{session:false}),function (req, res) {
        if(req.user.length > 0 ){
            queries.get_all_agent(function(errOne,resOne){
                res.json({
                    'status':200,
                    'message':'success',
                    'agent':resOne
                });
            });
        }
        else{
            res.json({
                "status":404,
                "message":"Something webnt wrong"
            });
        }
    })

    // End Agent Module
    //Cashier Module
    app.post('/list_cashier',function(req,res){
        cli.blue(JSON.stringify(req.body));
        var obj = {
            'vUserName': req.body.search.value, //Search Apply for default search text box
            'vEmail': req.body.search.value //Search Apply for default search text box
        };
        queries.ls_cashier_count(obj, function(err, record) {
            var iTotalRecords = parseInt(record[0].iTotalRecords);
            var iDisplayLength = parseInt(req.body.length);
            iDisplayLength = iDisplayLength < 0 ? iTotalRecords : iDisplayLength;
            var iDisplayStart = parseInt(req.body.start);
            var end = iDisplayStart + iDisplayLength;
            end = end > iTotalRecords ? iTotalRecords : end;
            var obj = {
                'limit': end,
                'offset': iDisplayStart,
                'vFullName': req.body.search.value,
                'vEmail': req.body.search.value,
                'sort':getSorting(req.body)
            };
            queries.ls_cashier_select(obj, function(err, users) {
                if (err) return err;
                var i = 0;
                var records = {};
                records['draw'] = req.body.draw;
                records['recordsTotal'] = iTotalRecords;
                records['recordsFiltered'] = iTotalRecords;
                records['data'] = [];
                for (var key in users) {
                    // var status = '<input bs-switch ng-model="'+users[i].eStatus+'" value="'+users[i].eStatus+'" class="switch-small" type="checkbox" ng-true-value="&apos;y&apos;" ng-false-value="&apos;n&apos;" ng-change="onUserStatusChange(&apos;'+users[i].eStatus+'&apos;,'+users[i].iUserId+')">';
                    var operation = '<button ng-click="userOperation('+users[i].iUserId+',&quot;view&quot;)" title="View"  class="btn btn-success btn-xs">View</button>';
                    operation+= '<button ng-click="userOperation('+users[i].iUserId+',&quot;edit&quot;)" title="Edit"  class="btn btn-warning  btn-xs">Edit</button>';
                    operation+= '<button ng-click="userOperation('+users[i].iUserId+',&quot;delete&quot;)" title="Delete"  class="btn btn-danger  btn-xs">Delete</button>';
                    records['data'][i] = {"iUserId":users[i].iUserId,"vFullName":users[i].vFullName,"vEmail":users[i].vEmail,"eStatus":users[i].eStatus,"vOperation":operation,"vUserType":users[i].vUserType};
                    i++;
                }
                res.json(records);
            });
        });
    });

    app.post('/add_cashier',passport.authenticate('jwt',{session:false}),function (req,res) {
        if(req.user.length > 0){
            req.checkBody('vFullName',"Please Enter Full Name").notEmpty();
            req.checkBody('vEmail','Please Enter Email Address').notEmpty();
            req.checkBody('vEmail','Please Enter Proper Email').isEmail();
            req.checkBody('iAgentId','Please Select Agent').notEmpty();
            req.getValidationResult().then(function(result){
                if(!result.isEmpty()){
                    res.json({
                        "status": 404,
                        "message": "Please fill all required value",
                        "Data":result.mapped()
                    });
                }else{
                    checkUser(req.body.vEmail,function(errOne,isActive){
                        if(errOne) throw errOne;
                        if(isActive.length > 0) {
                            res.json({
                                "status":404,
                                "message":"User already available"
                            });
                        }else{
                            var vPassword = randomstring.generate(6);
                            queries.addUser({"vUserType":"cashier","vFullName":req.body.vFullName,"vUserName":req.body.vEmail,"vEmail":req.body.vEmail,"vPassword":vPassword},function(errTwo,resTwo){
                                if(errTwo) throw errTwo;
                                queries.add_tbl_cashiers({iUserId:resTwo.insertId,iAgentId:req.body.iAgentId},function(errThree,resThree){
                                    if(errThree) throw errThree;
                                    if(resThree.insertId > 0) {
                                        //Send Mail
                                        var mailOptions = {
                                            from: '"Bet50" <info@Bet50.com>', // sender address
                                            to: req.body.vEmail, // list of receivers
                                            subject: 'Hello '+ req.body.vFullName, // Subject line
                                            text: 'One time password  : ' + vPassword // plaintext body
                                        };
                                        mail.sendMail(mailOptions,function(err,info){
                                            if(err){
                                                cli.red("Mail not send");
                                                console.log(err);
                                            }else{
                                                cli.yellow("Mail send");
                                            }
                                        });
                                        //Send mail end
                                        res.json({
                                            "status":200,
                                            "message":"User Insert Successfully."
                                        });
                                    }else{
                                        res.json({
                                            "status":400,
                                            "message":"Something went wrong"
                                        });
                                    }
                                });
                            });
                        }
                    });
                }
            });


        }else{
            res.status(401).json({
                'status':401,
                'message':'User does not exists'
            })
        }
    });

    app.post('/update_cashier',passport.authenticate('jwt',{session:false}),function (req,res) {
        if(req.user.length > 0){
            req.checkBody('vFullName',"Please Enter Full Name").notEmpty();
            req.checkBody('iUserId',"Please Enter User Details").notEmpty();
            req.checkBody('iAgentId','Please Select Agent').notEmpty();
            req.getValidationResult().then(function(result){
                if(!result.isEmpty()){
                    res.json({
                        "status": 404,
                        "message": "Please fill all required value",
                        "Data":result.mapped()
                    });
                }else{
                    checkUser(req.body.vEmail,function(errOne,isActive){
                        if(errOne) throw errOne;
                        if(isActive.length > 0) {
                            res.json({
                                "status":404,
                                "message":"User already available"
                            });
                        }else{
                            queries.updateUserById({vFullName:req.body.vFullName,id:req.body.iUserId},function(errOne,resOne){
                                if(errOne) throw errOne;
                                queries.update_tbl_cashiers({iAgentId:req.body.iAgentId,iUserId:req.body.iUserId},function(errTwo,resTwo){
                                    if(errTwo) throw errTwo;
                                    res.status(200).json({
                                       'status':'200',
                                        'message':'Record updated successfully.'
                                    });
                                });
                            });
                        }
                    });
                }
            });


        }else{
            res.status(401).json({
                'status':401,
                'message':'User does not exists'
            })
        }
    });

    //Cashier Module End
}

/**
 * Magic happen for data table sorting function
 * @param req
 * @returns {*}
 */
function getSorting(req) {
    var i = 0;
    var vSort = [];
    for (i = 0; i < req.order.length; i++) {
        vSort.push(req.columns[req.order[i].column].name + ' ' + req.order[i].dir);
    }
    return vSort.toString();
}

/**
 * Check Email Available or not
 * @param vEmail
 * @param cb
 */
function checkUser(vEmail,cb){
    queries.checkEmail({'vEmail':vEmail},cb);
}