var sql = require('./sql');
var Q = require('q');

exports.addAlarm = function (deviceId, picId) {

    //Step 1
    var getRelationUsers = function (deviceId) {
        var deferred = Q.defer();
        var s = 'SELECT id_user from user_device where id_device = "' + deviceId + '"';
        sql.execute(s, function (err, rows) {
            if (err) {
                console.log(err);
            } else {
                deferred.resolve(rows);
            }
        });
        return deferred.promise;
    };

    //Step 2
    var addRecordsAndSendMessages = function (data) {
        var deferred = Q.defer();
        var JPush = require('./JPush');
        var i;
        var userId;
        var s;
        var content = {};
        var time = new Date().getTime();
        content.deviceId = deviceId;
        content.time = time;
        content.picId = picId;
        content.type = 'alarm';
        for (i=0 ; i < data.length ; i++) {
            userId = data[i].id_user;
            content.userId = userId;
            s = 'INSERT INTO historyalarm (id_user,id_device,time) VALUES (' + userId + ',"' + deviceId + '",' + time + ')';
            sql.execute(s, function (err, rows, fields) {
                if (err) {
                    console.log(err);
                } else {
                    content.recordId = rows.insertId;
                    JPush.pushMessage(parseInt(userId), JSON.stringify(content));
                }
            });
        }
        deferred.resolve();
        return deferred.promise;
    };

    //Promise
    getRelationUsers(deviceId)
        .then(addRecordsAndSendMessages)
        .catch(function (error) {
            // Handle any error from all above steps
            console.log('error : ' + error);
        });
};

exports.addAlarm('ov_orange_01', 'dsdsd');

exports.getHistoryAlarm = function (userId) {
    var deferred = Q.defer();
    var s = 'SELECT * FROM historyalarm WHERE id_user = ' + userId;
    sql.execute(s, function (err, rows) {
        if (err) {
            console.log(err);
        } else {
            deferred.resolve({status: 'success', code: 1, msg: '', results:rows});
        }
    });
    return deferred.promise;
};

exports.readHistoryAlarm = function (_id) {
    var deferred = Q.defer();
    var s = 'UPDATE historyalarm SET status = 1 WHERE _id_user = ' + _id;
    sql.execute(s, function (err, rows) {
        if (err) {
            console.log(err);
        } else {
            deferred.resolve({status: 'success', code: 1, msg: '已将该记录设置为已读'});
        }
    });
    return deferred.promise;
};