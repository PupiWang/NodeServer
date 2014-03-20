var Q = require('q');
var sql = require('../util/sql');
var userUtil = require('../util/userUtil');
var alarmUtil = require('../util/alarmUtil');

/**
 * 获取历史告警
 * @param  {string} userId   用户名
 * @param  {string} password 密码
 * @param  {string} time     指定获取哪个时间段之后的
 */
exports.getHistoryAlarm = function (userId, password, time) {

    var serviceDeferred = Q.defer();

    userUtil.validUser(userId, password)
        .then(function (data) {
            var deferred = Q.defer();
            deferred.resolve({
                userId : data._id,
                time : time
            });
            return deferred.promise;
        })
        .then(alarmUtil.getHistoryAlarm)
        .then(function (data) {
            //成功返回结果
            serviceDeferred.resolve(data);
        })
        .catch(function (error) {
            // Handle any error from all above steps
            console.log('error : ' + error);
            serviceDeferred.reject(error);
        });

    return serviceDeferred.promise;

};

/**
 * 设置告警记录
 * @param  {string} userId   用户名
 * @param  {string} password 密码
 * @param  {string} recordId 告警记录Id
 */
exports.readHistoryAlarm = function (userId, password, recordId) {

    var serviceDeferred = Q.defer();

    userUtil.validUser(userId, password)
        .then(function () {
            var deferred = Q.defer();
            deferred.resolve(recordId);
            return deferred.promise;
        })
        .then(function (data) {
            //成功返回结果
            serviceDeferred.resolve(data);
        })
        .catch(function (error) {
            // Handle any error from all above steps
            console.log('error : ' + error);
            serviceDeferred.reject(error);
        });

    return serviceDeferred.promise;

};