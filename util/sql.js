var mysql = require('mysql');
var dbConfig = {
    host     : 'onevoout.mysql.rds.aliyuncs.com',
    user     : 'pupi',
    database : 'onevo',
    password : 'PUPI_1'
};

exports.execute = function (sql, callback) {
    var connection = mysql.createConnection(dbConfig);
    connection.connect(function () {
        console.log(sql);
    });
    connection.query(sql, callback);
    connection.end();
};

var userSQL = {
    getUserIdByUserName : function (userName, type) {
        var s = 'SELECT _id FROM user WHERE ' + type + ' = ?';
        return mysql.format(s,[userName]);
    },
    validUser : function (userName, type) {
        var s = 'SELECT * FROM user WHERE ' + type + ' = ?';
        return mysql.format(s,[userName]);
    },
    setLoginTime : function (time, id) {
        var s = 'UPDATE user SET datetime_lastlogin = ? WHERE _id = ?';
        return mysql.format(s,[time, id]);
    },
    createUser : function (userName, password, type, time) {
        var s = 'INSERT INTO user (' + type + ',password,datetime_signup,datetime_lastlogin) VALUES (?,?,?,?)';
        return mysql.format(s,[userName, password, time, time]);
    },
    sendActivationMessage : function (userName, e, type) {
        var s = 'UPDATE user SET activation_e = ? WHERE ' + type + ' = ?';
        return mysql.format(s,[e, userName]);
    },
    activateUser : function (userName, e, time, type) {
        var s = 'UPDATE user SET activation_date = ? , activation_e = "" WHERE activation_e = ? AND ' + type + ' = ?';
        return mysql.format(s,[time, e, userName]);
    },
    modifyPassword : function (id, password) {
        var s = 'UPDATE `user` SET `password` = ? WHERE `_id` = ?';
        return mysql.format(s,[password, id]);
    },
    sendPIN : function (time, e, type, userName) {
        var s = 'UPDATE user SET rstpwd_time = ? , rstpwd_e = ? WHERE ' + type + ' = ?';
        return mysql.format(s,[time, e, userName]);
    },
    validPIN : function (userName, e, type) {
        var s = 'SELECT _id FROM user where ' + type + ' = ? AND rstpwd_e = ?';
        return mysql.format(s,[userName, e]);
    },
    resetE : function (e, userName, type) {
        var s = 'UPDATE user SET rstpwd_e = ? WHERE ' + type + ' = ?';
        return mysql.format(s,[e, userName]);
    }
};

var deviceSQL = {
    getDevicesByUser : function (id) {
        var s = 'SELECT * FROM user_device ud, device d WHERE ud.id_device = d.id_device AND ud.id_user = ? ';
        return mysql.format(s,[id]);
    },
    getUsersByDevice : function (deviceId) {
        var s = 'SELECT u._id , u.email , u.phone , u.username FROM user_device ud , user u WHERE ud.id_device = ? AND ud.isadmin = 0 AND u._id = ud.id_user';
        return mysql.format(s,[deviceId]);
    },
    isAdminOfDevice : function (userId, deviceId) {
        var s = 'SELECT isadmin FROM user_device WHERE id_user = ? AND id_device = ? ';
        return mysql.format(s,[userId, deviceId]);
    },
    isDeviceExist : function (deviceId) {
        var s = 'SELECT * FROM device WHERE id_device = ? ';
        return mysql.format(s,[deviceId]);
    },
    checkAdminBinding : function (deviceId) {
        var s = 'SELECT * FROM user_device ud WHERE id_device = ?';
        return mysql.format(s,[deviceId]);
    },
    checkSameBinding : function (userId, deviceId) {
        var s = 'SELECT * FROM user_device ud WHERE ud.id_user = ? AND ud.id_device = ? ';
        return mysql.format(s,[userId, deviceId]);
    },
    addAdminForDevice : function (userId, deviceId) {
        var s = 'INSERT INTO user_device (id_user,id_device,display_name,isadmin) VALUES (?,?,?,1) ';
        return mysql.format(s,[userId, deviceId, deviceId]);
    },
    addUserForDevice : function (userId, deviceId) {
        var s = 'INSERT INTO user_device (id_user,id_device,display_name,isadmin) VALUES (?,?,?,0) ';
        return mysql.format(s,[userId, deviceId, deviceId]);
    },
    deleteUserForDevice : function (userId, deviceId) {
        var s = 'DELETE FROM user_device WHERE id_user = ? AND id_device = ?';
        return mysql.format(s,[userId, deviceId]);
    },
    modifyDeviceName : function (deviceName, userId, deviceId) {
        var s = 'UPDATE user_device SET display_name = ? WHERE id_user = ? AND id_device = ? ';
        return mysql.format(s,[deviceName, userId, deviceId]);
    },
    switchDeviceAlarm : function (userId, deviceId, isAlarmOpen) {
        var s = 'UPDATE user_device SET isAlarmOpen = ? WHERE id_user = ? AND id_device = ? ';
        return mysql.format(s,[isAlarmOpen, userId, deviceId]);
    },
    deviceConnect : function (deviceId) {
        var s = 'UPDATE device SET status = 1 WHERE id_device = ? ';
        return mysql.format(s,[deviceId]);
    },
    deviceDisconnect : function (deviceId) {
        var s = 'UPDATE device SET status = 0 WHERE id_device = ? ';
        return mysql.format(s,[deviceId]);
    }
};

var alarmSQL = {
    getRelationUsers : function (deviceId) {
        var s = 'SELECT id_user,isalarmopen from user_device where id_device = ?';
        return mysql.format(s,[deviceId]);
    },
    addRecordsAndSendMessages : function (userId,deviceId,picId,time) {
        var s = 'INSERT INTO historyalarm (id_user,id_device,id_pic,time) VALUES (?,?,?,?) ';
        return mysql.format(s,[userId,deviceId,picId,time]);
    },
    getHistoryAlarm : function (userId, time) {
        var s = 'SELECT * FROM historyalarm WHERE id_user = ? AND status = 0 AND time > ? ';
        return mysql.format(s,[userId, time]);
    },
    readHistoryAlarm : function (recordId) {
        var s = 'UPDATE historyalarm SET status = 1 WHERE _id = ?';
        return mysql.format(s,[recordId]);
    }
};

exports.userSQL = userSQL;
exports.deviceSQL = deviceSQL;
exports.alarmSQL = alarmSQL;