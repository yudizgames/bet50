var db = require("./connection");
var cli = require("../../config/config").console;
var md5 = require("md5");
var dateFormat = require("dateformat"); //dateFormat(new Date(),"yyyy-mm-dd HH:mm:ss"); Currnet date time
/**
 * if in comment @ means user only web
 * if in comment * means user only game
 * if in comment @* or *@ means user both game and web
 */

var Users = {
    //   *@   //
    getUser:function(body,callback){
        return db.query("SELECT *  FROM `tbl_users` WHERE `vEmail` = ? AND `vPassword` = ? AND `eStatus` != 'd'",[body.vEmail,md5(body.vPassword)],callback);
    },
    setTocket:function(body,callback){
        console.log("setTocken call");
        return db.query("INSERT INTO tbl_user_devices (iUserId,vAuthToken,eDeviceType) VALUES (?,?,?)",[body.iUserId, body.token, body.eDeviceType], callback);
    },
    authenticate: function(body, cb){
        console.log("authentications call");
        db.query("SELECT u.iUserId,d.iDeviceId FROM tbl_users as u INNER JOIN tbl_user_devices as d ON (d.iUserId = u.iUserId) WHERE d.vAuthToken = ? AND u.eStatus = ? AND d.eDeviceType = ? AND u.vUserType = ?",[body.token,'y',body.device,body.vUserType],cb);
    },
    //   *@   //
    logOut:function (body,cb) {
        console.log("Loug Out Call");
        db.query("DELETE FROM tbl_user_devices WHERE iDeviceId = ?",[body.iDeviceId],cb);
    },
    checkPassword:function(body,cb){

        db.query("SELECt * FROM tbl_users where iUserId = ? AND vPassword = ?",[body.iUserId,md5(body.vOldPassword)],cb);
    },
    changePassword:function(body,cb){
        console.log("Change PAssword call");
        console.log(body);
        db.query("UPDATE tbl_users SET vPassword = ? WHERE iUserId = ?",[md5(body.vNewPassword),body.iUserId],cb);
    },
    checkEmail:function(body,cb){
        db.query("SELECT * FROM tbl_users WHERE vEmail = ? AND eStatus = ?",[body.vEmail,'y'],cb);
    },
    forgotPass:function(body,cb){
        db.query("UPDATE tbl_users SET vPassword = ? WHERE vEmail = ?",[md5(body.vNewPassword),body.vEmail],cb);
    },
    getSettings: function(body,cb){
        db.query("SELECT * FROM mst_site_settings WHERE eEditable = ? ORDER BY iFieldId",['y'], cb);
    },
    saveSettings : function(params, cb){
        db.query("UPDATE mst_site_settings SET vValue = ? WHERE iFieldId = ?", params, cb);
    },
    ls_user_count: function(body, cb){

        if(body.vUserType == 'super_admin'){

            var kWhere = "";
            var vWhere = ['user','d'];
            if(typeof body.vUserName != 'undefined' && body.vUserName != "")
            {
                kWhere += ' AND tbl_users.vUserName LIKE ?';
                vWhere.push('%'+body.vUserName+'%');
            }
            if(typeof body.vEmail != "undefined" && body.vEmail != "")
            {
                kWhere += ' AND tbl_users.vEmail LIKE ?';
                vWhere.push('%'+body.vEmail+'%');
            }
            db.query("SELECT COUNT(*) as iTotalRecords " +
                " FROM tbl_users " +
                " WHERE tbl_users.vUserType = ? AND tbl_users.eStatus != ?"+kWhere,vWhere,cb);


        }else{

            var kWhere = "";
            var vWhere = ['user','d',body.iUserId];
            if(typeof body.vUserName != 'undefined' && body.vUserName != "")
            {
                kWhere += ' AND tbl_users.vUserName LIKE ?';
                vWhere.push('%'+body.vUserName+'%');
            }
            if(typeof body.vEmail != "undefined" && body.vEmail != "")
            {
                kWhere += ' AND tbl_users.vEmail LIKE ?';
                vWhere.push('%'+body.vEmail+'%');
            }
            db.query("SELECT COUNT(*) as iTotalRecords " +
                " FROM tbl_users " +
                " JOIN tbl_child ON tbl_users.iUserId = tbl_child.iUserId " +
                " JOIn tbl_parent ON tbl_child.iParentId = tbl_parent.iParentId" +
                " WHERE tbl_users.vUserType = ? AND tbl_users.eStatus != ?  AND tbl_parent.iUserId = ?"+kWhere,vWhere,cb);

        }


    },

    ls_user_select: function(body, cb){
        cli.blue(JSON.stringify(body));
        if(body.vUserType == 'super_admin'){


            var sWhere = "";
            var aWhere = ['user','d',body.iParentId];
            var sort = "";
            /**
             * Column Search Depending on Table
             */
            if(typeof body.vUserName != 'undefined' && body.vUserName != "")
            {
                sWhere += ' AND vUserName LIKE ?';
                aWhere.push('%'+body.vUserName+'%');
            }
            if(typeof body.vEmail != "undefined" && body.vEmail != "")
            {
                sWhere += ' AND vEmail LIKE ?';
                aWhere.push('%'+body.vEmail+'%');
            }
            if(typeof body.sort != 'undefined' && body.sort != "") {sort = body.sort};
            cli.blue(JSON.stringify(body));
            db.query("SELECT " +
                " iUserId, " +
                " vFullName, " +
                " vUserName, " +
                " vEmail, " +
                " eStatus, " +
                " vUserType " +
                " FROM tbl_users  " +
                " WHERE vUserType = ? AND eStatus != ? "+sWhere+" ORDER BY "+sort+" LIMIT "+body.offset+", "+body.limit,aWhere,cb);

        }else{

            var sWhere = "";
            var aWhere = ['user','d',body.iParentId];
            var sort = "";
            /**
             * Column Search Depending on Table
             */
            if(typeof body.vUserName != 'undefined' && body.vUserName != "")
            {
                sWhere += ' AND vUserName LIKE ?';
                aWhere.push('%'+body.vUserName+'%');
            }
            if(typeof body.vEmail != "undefined" && body.vEmail != "")
            {
                sWhere += ' AND vEmail LIKE ?';
                aWhere.push('%'+body.vEmail+'%');
            }
            if(typeof body.sort != 'undefined' && body.sort != "") {sort = body.sort};
            cli.blue(JSON.stringify(body));
            db.query("SELECT " +
                " tbl_users.iUserId, " +
                " tbl_users.vFullName, " +
                " tbl_users.vUserName, " +
                " tbl_users.vEmail, " +
                " tbl_users.eStatus, " +
                " tbl_users.vUserType " +
                " FROM tbl_users  " +
                " JOIN tbl_child ON tbl_users.iUserId = tbl_child.iUserId " +
                " JOIN tbl_parent ON tbl_child.iParentId = tbl_parent.iParentId " +
                " WHERE tbl_users.vUserType = ? AND tbl_users.eStatus != ? AND tbl_parent.iUserId = ? "+sWhere+" ORDER BY "+sort+" LIMIT "+body.offset+", "+body.limit,aWhere,cb);

        }


    },
    //   *@   //

    getUserById:function(body,cb){
      db.query("SELECT * FROM tbl_users WHERE iUserId = ? AND eStatus != 'd'",[body.id],cb);
    },

    deleteUserById:function(body,cb){
        db.query("UPDATE tbl_users SET eStatus = ? WHERE iUserId = ?",['d',body.id],cb);
    },

    changeUserStatusById:function(body,cb){
        console.log("User Status");
        cli.blue(JSON.stringify(body));
        db.query("UPDATE tbl_users SET eStatus = ? WHERE iUserId = ?",[body.eStatus,body.id],cb);
    },

    updateUserById:function(body,cb){
        db.query("UPDATE tbl_users SET vFullName = ? , vUserName = ?, dLastActivity = ? WHERE iUserId = ? ",[body.vFullName,body.vFullName,dateFormat(new Date(),"yyyy-mm-dd HH:mm:ss"),body.id],cb);
    },

    addUser:function (body,cb) {
        db.query("INSERT INTO tbl_users (vUserType,vFullName,vUserName,vEmail,vPassword,eStatus,dLastActivity,dCreatedDate) VALUES (?,?,?,?,?,?,?,?)",[body.vUserType,body.vFullName,body.vUserName,body.vEmail,md5(body.vPassword),'y',dateFormat(new Date(),"yyyy-mm-dd HH:mm:ss"),dateFormat(new Date(),"yyyy-mm-dd HH:mm:ss")],cb);
    },

    updateAfterInsertQuestion(body,cb){
        db.query("UPDATE tbl_questions SET iAnswerId = ? , eStatus = ? WHERE iQuestionId= ?",[body.iAnswerId,'y',body.iQuestionId],cb);
    },

    get_round_details:function(body,cb){
        db.query("SELECT"+
            " tbl_exam_participant.iTotalQuestion,"+
            " tbl_exam_participant.iRightAnswers,"+
            " tbl_exam_participant.iWrongAnswers,"+
            " tbl_exam_participant.iParticipantId,"+
            " tbl_users.iUserId,"+
            " tbl_users.vFullName"+
            " FROM tbl_exam_schedule"+
            " JOIN tbl_exam_participant ON tbl_exam_participant.iScheduleId = tbl_exam_schedule.iScheduleId"+
            " JOIN tbl_users ON tbl_exam_participant.iUserId = tbl_users.iUserId"+
            " WHERE tbl_exam_schedule.iExamId = ? ",[body.iExamId],cb);
    },

    ls_agent_count: function(body, cb){
        var kWhere = "";
        var vWhere = ['agent','d'];
        if(typeof body.vUserName != 'undefined' && body.vUserName != "")
        {
            kWhere += ' AND vUserName LIKE ?';
            vWhere.push('%'+body.vUserName+'%');
        }
        if(typeof body.vEmail != "undefined" && body.vEmail != "")
        {
            kWhere += ' AND vEmail LIKE ?';
            vWhere.push('%'+body.vEmail+'%');
        }
        db.query("SELECT COUNT(*) as iTotalRecords FROM tbl_users WHERE vUserType = ? AND eStatus != ? "+kWhere,vWhere,cb);
    },

    ls_agent_select: function(body, cb){
        var sWhere = "";
        var aWhere = ['agent','d'];
        var sort = "";
        /**
         * Column Search Depending on Table
         */
        if(typeof body.vUserName != 'undefined' && body.vUserName != "")
        {
            sWhere += ' AND vUserName LIKE ?';
            aWhere.push('%'+body.vUserName+'%');
        }
        if(typeof body.vEmail != "undefined" && body.vEmail != "")
        {
            sWhere += ' AND vEmail LIKE ?';
            aWhere.push('%'+body.vEmail+'%');
        }
        if(typeof body.sort != 'undefined' && body.sort != "") {sort = body.sort};

        db.query("SELECT iUserId, vFullName, vUserName, vEmail ,eStatus ,vUserType FROM tbl_users WHERE vUserType = ? AND eStatus != ? "+sWhere+" ORDER BY "+sort+" LIMIT "+body.offset+", "+body.limit,aWhere,cb);
    },

    ls_cashier_count: function(body, cb){
        var kWhere = "";
        var vWhere = ['cashier','d'];
        if(typeof body.vUserName != 'undefined' && body.vUserName != "")
        {
            kWhere += ' AND vUserName LIKE ?';
            vWhere.push('%'+body.vUserName+'%');
        }
        if(typeof body.vEmail != "undefined" && body.vEmail != "")
        {
            kWhere += ' AND vEmail LIKE ?';
            vWhere.push('%'+body.vEmail+'%');
        }
        db.query("SELECT COUNT(*) as iTotalRecords FROM tbl_users WHERE vUserType = ? AND eStatus != ? "+kWhere,vWhere,cb);
    },

    ls_cashier_select: function(body, cb){
        var sWhere = "";
        var aWhere = ['cashier','d'];
        var sort = "";
        /**
         * Column Search Depending on Table
         */
        if(typeof body.vUserName != 'undefined' && body.vUserName != "")
        {
            sWhere += ' AND vUserName LIKE ?';
            aWhere.push('%'+body.vUserName+'%');
        }
        if(typeof body.vEmail != "undefined" && body.vEmail != "")
        {
            sWhere += ' AND vEmail LIKE ?';
            aWhere.push('%'+body.vEmail+'%');
        }
        if(typeof body.sort != 'undefined' && body.sort != "") {sort = body.sort};

        db.query("SELECT iUserId, vFullName, vUserName, vEmail ,eStatus ,vUserType FROM tbl_users WHERE vUserType = ? AND eStatus != ? "+sWhere+" ORDER BY "+sort+" LIMIT "+body.offset+", "+body.limit,aWhere,cb);
    },

    ls_cashier_count_agent_panel: function(body, cb){
        cli.blue(JSON.stringify(body));
        var kWhere = "";
        var vWhere = ['cashier','d',body.iAgentId];
        if(typeof body.vUserName != 'undefined' && body.vUserName != "")
        {
            kWhere += ' AND tbl_users.vUserName LIKE ?';
            vWhere.push('%'+body.vUserName+'%');
        }
        if(typeof body.vEmail != "undefined" && body.vEmail != "")
        {
            kWhere += ' AND tbl_users.vEmail LIKE ?';
            vWhere.push('%'+body.vEmail+'%');
        }
        db.query("SELECT COUNT(*) as iTotalRecords FROM tbl_users JOIN tbl_cashiers ON tbl_users.iUserId = tbl_cashiers.iUserId WHERE tbl_users.vUserType = ? AND tbl_users.eStatus != ? AND tbl_cashiers.iAgentId = ? "+kWhere,vWhere,cb);
    },

    ls_cashier_select_agent_panel: function(body, cb){
        var sWhere = "";
        var aWhere = ['cashier','d',body.iAgentId];
        var sort = "";
        /**
         * Column Search Depending on Table
         */
        if(typeof body.vUserName != 'undefined' && body.vUserName != "")
        {
            sWhere += ' AND tbl_users.vUserName LIKE ?';
            aWhere.push('%'+body.vUserName+'%');
        }
        if(typeof body.vEmail != "undefined" && body.vEmail != "")
        {
            sWhere += ' AND tbl_users.vEmail LIKE ?';
            aWhere.push('%'+body.vEmail+'%');
        }
        if(typeof body.sort != 'undefined' && body.sort != "") {sort = body.sort};
        db.query("SELECT tbl_users.iUserId, tbl_users.vFullName, tbl_users.vUserName, tbl_users.vEmail ,tbl_users.eStatus , tbl_users.vUserType FROM tbl_users" +
            " JOIN tbl_cashiers ON tbl_users.iUserId = tbl_cashiers.iUserId WHERE tbl_users.vUserType = ? AND tbl_users.eStatus != ? AND tbl_cashiers.iAgentId = ? "+sWhere+" ORDER BY "+sort+" LIMIT "+body.offset+", "+body.limit,aWhere,cb);
    },

    get_child_by_client_id:function(body,cb){
        db.query("SELECT child.vFullName as ChildName, child.vEmail as ChildEmail, child.vUserName as ChildUserName, parent.vUserName, parent.vFullName as ParentName, parent.vEmail as ParentEmail FROM tbl_child as c" +
            " JOIN tbl_parent as p ON p.iParentId = c.iParentId" +
            " JOIN tbl_users as parent ON p.iUserId = parent.iUserId" +
            " JOIN tbl_users as child ON child.iUserId = c.iUserId" +
            " WHERE p.iUserId = ? AND parent.eStatus != 'd' AND child.eStatus != 'd'",[body.id],cb);
    },

    addParent:function(body,cb){
        db.query("INSERT INTO tbl_parent ( iUserId) VALUES ( '?')",[body.iUserId],cb);
    },

    get_cashier_by_id:function(body,cb){
        db.query("SELECT cashier.*,agent.vFullName as a_vFullName,agent.iUserId as iAgentId FROM tbl_users as cashier "+
        "JOIN tbl_cashiers ON tbl_cashiers.iUserId = cashier.iUserId " +
        "JOIN tbl_users as agent ON tbl_cashiers.iAgentId = agent.iUserId WHERE cashier.iUserId = ?",[body.iUserId],cb);
    },

    get_all_agent:function(cb){
        db.query("SELECT * FROM tbl_users WHERE vUserType = 'agent' AND eStatus = 'y' ",cb);
    },

    add_tbl_cashiers:function(body,cb){
        db.query("INSERT INTO tbl_cashiers (iUserId,iAgentId) VALUES (?,?)",[body.iUserId,body.iAgentId],cb);
    },

    update_tbl_cashiers:function(body,cb){
        db.query("UPDATE tbl_cashiers SET iAgentId = ? WHERE iUserId = ?",[body.iAgentId,body.iUserId],cb);
    },

    /**
     * Credit Management Begin
     */
    get_credit:function(body,cb){
        console.log(body.iUserId);
        db.query("SELECT * FROM tbl_credits WHERE iUserId = ?",[body.iUserId],cb);
    },
    add_tbl_credit_history:function(body,cb){
        db.query("INSERT INTO tbl_credits_history (iSRUserOneId,iSRUserTwoId,dCredit,eCreditType,vComment) values (?,?,?,?,?)",[body.iSRUserOneId,body.iSRUserTwoId,body.dCredit,body.eCreditType,body.vComment],cb);
    },
    add_credit:function(body,cb){
        db.query("UPDATE tbl_credits SET dCredit = dCredit + ? WHERE iUserId = ?",[body.dCredit,body.iUserId],cb);
    },
    debit_credit:function(body,cb){
        db.query("UPDATE tbl_credits SET dCredit = dCredit - ? WHERE iUserId = ?",[body.dCredit,body.iUserId],cb);
    },
    insert_credit:function(body,cb){
        db.query("INSERT INTO tbl_credits (iUserId,dCredit) VALUES (?,?)",[body.iUserId,body.dCredit],cb);
    }
    /**
     * Credit Management Stopn
     */

};
module.exports = Users;

/**
 *
 * Basic Structure for Generate list Query
 ls_question_count:function(body,cb){
        var kWhere = "";
        var vWhere = [];
        db.query("SELECT COUNT(*) FROM tbl_questions WHERE tbl_questions.eStatus != 'd'",cb);
    },
 ls_question_select:function(body,cb){
        var kWhere = "";
        var vWhere = [];
        var sort = "";
        if(typeof body.sort != 'undefined' && body.sort != "") {sort = body.sort};
        db.query("SELECT * FROM tbl_questions WHERE tbl_questions.eStatus != 'd' ORDER BY "+sort+" LIMIT "+body.offset +" ,"+body.limit,cb);
    },
 *
 *
 *
 */
