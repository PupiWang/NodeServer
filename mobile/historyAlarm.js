var alarmMessageUtil = require('../util/alarmMessageUtil');
var userUtil = require('../util/userUtil');
var Q = require('q');

exports.getHistoryAlarm = function (req, res) {
    var userId = req.body.userId || req.param('userId'),
        password = req.body.password || req.param('password');

    userUtil.validUser(userId, password)
        .then(alarmMessageUtil.getHistoryAlarm)
        .then(function (data) {
            //成功返回结果
            res.send(data);
        })
        .catch(function (error) {
            // Handle any error from all above steps
            console.log('error : ' + error);
            res.send(error);
        });
};

exports.readHistoryAlarm = function (req, res) {
    var userId = req.body.userId || req.param('userId'),
        password = req.body.password || req.param('password'),
        recordId = req.body.recordId || req.param('recordId');

    var delivaryParams = function () {
        var deferred = Q.defer();
        deferred.resolve(recordId);
        return deferred.promise;
    };

    userUtil.validUser(userId, password)
        .then(delivaryParams)
        .then(alarmMessageUtil.readHistoryAlarm)
        .then(function (data) {
            //成功返回结果
            res.send(data);
        })
        .catch(function (error) {
            // Handle any error from all above steps
            console.log('error : ' + error);
            res.send(error);
        });
};