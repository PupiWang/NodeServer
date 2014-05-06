var sql = require('./sql');
var Q = require('q');

exports.addAlarm = function (deviceId, picId) {

    //Step 1
    var getRelationUsers = function (deviceId) {
        var deferred = Q.defer();
        var s = sql.alarmSQL.getRelationUsers(deviceId);
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
        var content = {};
        var time = new Date().getTime();
        content.deviceId = deviceId;
        content.time = time;
        content.picId = picId;
        content.type = 'alarm';

        var aRASM = function (userId, content) {
            var s = sql.alarmSQL.addRecordsAndSendMessages(userId, deviceId, picId, time);
            sql.execute(s, function (err, rows) {
                if (err) {
                    console.log(err);
                } else {
                    content.recordId = rows.insertId;
                    content.userId = userId;
                    JPush.pushMessage(parseInt(userId), JSON.stringify(content));
                }
            });
        };

        for (i=0 ; i < data.length ; i++) {
            userId = data[i].id_user;
            console.log(parseInt(data[i].isalarmopen) === 1);
            if (parseInt(data[i].isalarmopen) === 1) {
                aRASM(userId,content);
            }
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

exports.getHistoryAlarm = function (data) {
    var userId = data.userId;
    var time = data.time;
    var deferred = Q.defer();
    var s = sql.alarmSQL.getHistoryAlarm(userId, time);
    sql.execute(s, function (err, rows) {
        if (err) {
            console.log(err);
        } else {
            deferred.resolve({status: 'success', code: 1, msg: '', results: rows});
        }
    });
    return deferred.promise;
};

exports.readHistoryAlarm = function (_id) {
    var deferred = Q.defer();
    var s = sql.alarmSQL.readHistoryAlarm(_id);
    sql.execute(s, function (err) {
        if (err) {
            console.log(err);
        } else {
            deferred.resolve({status: 'success', code: 1, msg: '已将该记录设置为已读'});
        }
    });
    return deferred.promise;
};