var Q = require('q');
var userUtil = require('../util/userUtil');
var deviceUtil = require('../util/deviceUtil');

/**
 * 获取用户关联设备
 * @param userId     用户名
 * @param password   密码
 */
exports.getDevicesByUser = function (userId, password) {

    var serviceDeferred = Q.defer();

    userUtil.validUser(userId, password)
        .then(deviceUtil.getDevicesByUser)
        .then(function (data) {
            // Success
            serviceDeferred.resolve(data);
        })
        .catch(function (error) {
            // Handle any error from all above steps
            serviceDeferred.reject(error);
        });

    return serviceDeferred.promise;

};

/**
 * 获取设备关联的普通用户
 * @param userId     用户名
 * @param password   密码
 * @param deviceId   设备号
 */
exports.getUsersByDevice = function (userId, password, deviceId) {

    var serviceDeferred = Q.defer();

    userUtil.validUser(userId, password)
        .then(function (data) {
            var deferred = Q.defer();
            deferred.resolve({
                userId : data._id,
                deviceId : deviceId
            });
            return deferred.promise;
        })
        .then(deviceUtil.isAdminOfDevice)
        .then(function () {
            var deferred = Q.defer();
            deferred.resolve(deviceId);
            return deferred.promise;
        })
        .then(deviceUtil.getUsersByDevice)
        .then(function (data) {
            // Success
            serviceDeferred.resolve(data);
        })
        .catch(function (error) {
            // Handle any error from all above steps
            serviceDeferred.reject(error);
        });

    return serviceDeferred.promise;

};

/**
 * 为新设备绑定管理员
 * @param userId    用户名
 * @param password  密码
 * @param deviceId  设备号
 */
exports.bindingAdmin = function (userId, password, deviceId) {

    var serviceDeferred = Q.defer();

    userUtil.validUser(userId, password)
        .then(function (data) {
            var deferred = Q.defer();
            deferred.resolve({
                userId : data._id,
                deviceId : deviceId
            });
            return deferred.promise;
        })
        .then(deviceUtil.isDeviceExist)
        .then(deviceUtil.checkAdminBinding)
        .then(deviceUtil.addAdminForDevice)
        .then(function (data) {
            // Success
            serviceDeferred.resolve(data);
        })
        .catch(function (error) {
            // Handle any error from all above steps
            serviceDeferred.reject(error);
        });

    return serviceDeferred.promise;

};

/**
 * 管理员为设备添加用户
 * @param userId    管理员用户名
 * @param password  管理员密码
 * @param userIdNew 新用户用户名
 * @param deviceId  设备号
 */
exports.bindingUser = function (userId, password, userIdNew, deviceId) {

    var serviceDeferred = Q.defer();

    userUtil.validUser(userId, password)
        .then(function (data) {
            var deferred = Q.defer();
            deferred.resolve({
                userId : data._id,
                deviceId : deviceId
            });
            return deferred.promise;
        })
        .then(deviceUtil.isAdminOfDevice)
        .then(function () {
            var deferred = Q.defer();
            deferred.resolve(userIdNew);
            return deferred.promise;
        })
        .then(userUtil.getUserIdByUserName)
        .then(function (_id) {
            var deferred = Q.defer();
            deferred.resolve({
                userId : _id,
                deviceId : deviceId
            });
            return deferred.promise;
        })
        .then(deviceUtil.isDeviceExist)
        .then(deviceUtil.checkSameBinding)
        .then(deviceUtil.addUserForDevice)
        .then(function (data) {
            // Success
            serviceDeferred.resolve(data);
        })
        .catch(function (error) {
            // Handle any error from all above steps
            serviceDeferred.reject(error);
        });

    return serviceDeferred.promise;

};

/**
 * 管理员为设备移除用户
 * @param userId    管理员用户名
 * @param password  管理员密码
 * @param userIdNew 要移除用户的用户名
 * @param deviceId  设备号
 */
exports.removeUser = function (userId, password, userIdNew, deviceId) {

    var serviceDeferred = Q.defer();

    userUtil.validUser(userId, password)
        .then(function (data) {
            var deferred = Q.defer();
            deferred.resolve({
                userId : data._id,
                deviceId : deviceId
            });
            return deferred.promise;
        })
        .then(deviceUtil.isAdminOfDevice)
//        .then(function () {
//            var deferred = Q.defer();
//            deferred.resolve(userIdNew);
//            return deferred.promise;
//        })
//        .then(userUtil.getUserIdByUserName)
        .then(function () {
            var deferred = Q.defer();
            deferred.resolve({
                userId : userIdNew,
                deviceId : deviceId
            });
            return deferred.promise;
        })
        .then(deviceUtil.deleteUserForDevice)
        .then(function (data) {
            // Success
            serviceDeferred.resolve(data);
        })
        .catch(function (error) {
            // Handle any error from all above steps
            serviceDeferred.reject(error);
        });

    return serviceDeferred.promise;

};

/**
 * 修改设备名
 * @param userId        用户名
 * @param password      密码
 * @param deviceName    设备名
 * @param deviceId      设备号
 */
exports.modifyDeviceName = function (userId, password, deviceName, deviceId) {

    var serviceDeferred = Q.defer();

    userUtil.validUser(userId, password)
        .then(function (data) {
            var deferred = Q.defer();
            deferred.resolve({
                userId : data._id,
                deviceId : deviceId,
                deviceName : deviceName
            });
            return deferred.promise;
        })
        .then(deviceUtil.modifyDeviceName)
        .then(function (data) {
            // Success
            serviceDeferred.resolve(data);
        })
        .catch(function (error) {
            // Handle any error from all above steps
            serviceDeferred.reject(error);
        });

    return serviceDeferred.promise;

};

/**
 * 设备报警开关
 * @param userId        用户名
 * @param password      密码
 * @param deviceId      设备号
 */
exports.switchDeviceAlarm = function (userId, password, deviceId, isAlarmOpen) {

    var serviceDeferred = Q.defer();

    userUtil.validUser(userId, password)
        .then(function (data) {
            var deferred = Q.defer();
            deferred.resolve({
                userId : data._id,
                deviceId : deviceId,
                isAlarmOpen : isAlarmOpen
            });
            return deferred.promise;
        })
        .then(deviceUtil.switchDeviceAlarm)
        .then(function (data) {
            // Success
            serviceDeferred.resolve(data);
        })
        .catch(function (error) {
            // Handle any error from all above steps
            serviceDeferred.reject(error);
        });

    return serviceDeferred.promise;

};