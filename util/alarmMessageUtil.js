var sql = require('./sql');
var Q = require('q');

exports.addAlarm = function (deviceId, picId) {

    var picUrl = getDownloadUrl('ov-orange-private.u.qiniudn.com', picId);
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
    }

    //Step 2
    var addRecordsAndSendMessages = function (data) {
        var deferred = Q.defer();
        var JPush = require('./JPush');
        var i;
        var userId;
        var s;
        var content = {};
        var time = new Date().getTime();
        for (i=0 ; i < data.length ; i++) {
            userId = data.id_user;
            content.userId = userId;
            content.deviceId = deviceId;
            content.time = time;
            content.picId = picId;
            content.picUrl = picUrl;
            JPush.pushMessage(userId, content.toString());
            s = 'INSERT INTO historyalarm (id_user,id_device,time) VALUES (' + userId + ',"' + deviceId + '",' + time + ')';
            sql.execute(s, function (err) {
                if (err) {
                    console.log(err);
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