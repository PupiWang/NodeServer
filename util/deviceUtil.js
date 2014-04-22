var sql = require('./sql');
var Q = require('q');

/**
 * 获取设备列表
 * @param userObj
 * @returns {promise|Q.promise}
 */
exports.getDevicesByUser = function (userObj) {
    var deferred = Q.defer();
    var s = sql.deviceSQL.getDevicesByUser(userObj._id);
    sql.execute(s, function (err, rows) {
        if (err) {
            console.log(err);
            deferred.reject({status: 'error', code: 501, msg: err});
        } else {
            deferred.resolve({status: 'success', code: 1, msg: '验证通过', results: rows});
        }
    });
    return deferred.promise;
};

/**
 * 获取设备关联的普通用户
 * @param userObj
 * @returns {promise|Q.promise}
 */
exports.getUsersByDevice = function (deviceId) {
    var deferred = Q.defer();
    var s = sql.deviceSQL.getUsersByDevice(deviceId);
    sql.execute(s, function (err, rows) {
        if (err) {
            console.log(err);
            deferred.reject({status: 'error', code: 501, msg: err});
        } else {
            deferred.resolve({status: 'success', code: 1, msg: '验证通过', results: rows});
        }
    });
    return deferred.promise;
};

/**
 * 管理员判断
 * @param userObj
 * @returns {promise|Q.promise}
 */
exports.isAdminOfDevice = function (userDeviceObj) {
    var deferred = Q.defer();
    var userId = userDeviceObj.userId;
    var deviceId = userDeviceObj.deviceId;
    var s = sql.deviceSQL.isAdminOfDevice(userId, deviceId);
    sql.execute(s, function (err, rows) {
        if (err) {
            console.log(err);
            deferred.reject({status: 'error', code: 501, msg: err});
        } else {
            if (rows.length === 0 || rows[0].isadmin === 0) {
                deferred.reject({status: 'error', code: 1, msg: '此用户无管理员权限'});
            } else {
                deferred.resolve({status: 'success', code: 1, msg: '验证通过', results: rows});
            }
        }
    });
    return deferred.promise;
};

/**
 * 设备号检查
 * @param userDeviceObj
 * @returns {promise|Q.promise}
 */
exports.isDeviceExist = function (userDeviceObj) {
    var deferred = Q.defer();
    var deviceId = userDeviceObj.deviceId;
    //设备号是否存在
    var s = sql.deviceSQL.isDeviceExist(deviceId);
    sql.execute(s, function (err, rows) {
        if (err) {
            console.log(err);
            deferred.reject({status: 'error', code: 501, msg: err});
        } else {
            if (rows.length >= 1) {
                deferred.resolve(userDeviceObj);
            } else {
                deferred.reject({status: 'error', code: 1, msg: '设备号错误，不存在此设备...'});
            }
        }
    });
    return deferred.promise;
};

/**
 * 管理员与设备绑定检查
 * @param userDeviceObj
 * @returns {promise|Q.promise}
 */
exports.checkAdminBinding = function (userDeviceObj) {
    var deferred = Q.defer();
    var deviceId = userDeviceObj.deviceId;
    //检查用户是否绑定过此设备
    var s = sql.deviceSQL.checkAdminBinding(deviceId);
    sql.execute(s, function (err, rows) {
        if (err) {
            console.log(err);
            deferred.reject({status: 'error', code: 501, msg: err});
        } else {
            if (rows.length >= 1) {
                deferred.reject({status: 'error', code: 2, msg: '已经绑定了该设备，无法重复绑定...'});
            } else {
                deferred.resolve(userDeviceObj);
            }
        }
    });
    return deferred.promise;
};

/**
 * 用户与设备绑定检查
 * @param userDeviceObj
 * @returns {promise|Q.promise}
 */
exports.checkSameBinding = function (userDeviceObj) {
    var deferred = Q.defer();
    var userId = userDeviceObj.userId;
    var deviceId = userDeviceObj.deviceId;
    //检查用户是否绑定过此设备
    var s = sql.deviceSQL.checkSameBinding(userId, deviceId);
    sql.execute(s, function (err, rows) {
        if (err) {
            console.log(err);
            deferred.reject({status: 'error', code: 501, msg: err});
        } else {
            if (rows.length >= 1) {
                deferred.reject({status: 'error', code: 2, msg: '已经绑定了该设备，无法重复绑定...'});
            } else {
                deferred.resolve(userDeviceObj);
            }
        }
    });
    return deferred.promise;
};

/**
 * 为新设备添加管理员
 * @param userDeviceObj
 * @returns {promise|Q.promise}
 */
exports.addAdminForDevice = function (userDeviceObj) {
    var deferred = Q.defer();
    var userId = userDeviceObj.userId;
    var deviceId = userDeviceObj.deviceId;
    //绑定设备
    var s = sql.deviceSQL.addAdminForDevice(userId, deviceId);
    sql.execute(s, function (err) {
        if (err) {
            console.log(err);
            deferred.reject({status: 'error', code: 501, msg: err});
        } else {
            deferred.resolve({status: 'success', code: 1, msg: '添加设备成功...'});
        }
    });
    return deferred.promise;
};

/**
 * 为设备添加普通用户
 * @param userDeviceObj
 * @returns {promise|Q.promise}
 */
exports.addUserForDevice = function (userDeviceObj) {
    var deferred = Q.defer();
    var userId = userDeviceObj.userId;
    var deviceId = userDeviceObj.deviceId;
    //绑定设备
    var s = sql.deviceSQL.addUserForDevice(userId, deviceId);
    sql.execute(s, function (err) {
        if (err) {
            console.log(err);
            deferred.reject({status: 'error', code: 501, msg: err});
        } else {
            deferred.resolve({status: 'success', code: 1, msg: '添加设备成功...'});
        }
    });
    return deferred.promise;
};

/**
 * 为设备移除用户
 * @param userDeviceObj
 * @returns {promise|Q.promise}
 */
exports.deleteUserForDevice = function (userDeviceObj) {
    var deferred = Q.defer();
    var userId = userDeviceObj.userId;
    var deviceId = userDeviceObj.deviceId;
    //绑定设备
    var s = sql.deviceSQL.deleteUserForDevice(userId, deviceId);
    sql.execute(s, function (err) {
        if (err) {
            console.log(err);
            deferred.reject({status: 'error', code: 501, msg: err});
        } else {
            deferred.resolve({status: 'success', code: 1, msg: '删除用户成功...'});
        }
    });
    return deferred.promise;
};

/**
 * 修改设备显示名
 * @param userDeviceObj
 * @returns {promise|Q.promise}
 */
exports.modifyDeviceName = function (userDeviceObj) {
    var deferred = Q.defer();
    var userId = userDeviceObj.userId;
    var deviceId = userDeviceObj.deviceId;
    var deviceName = userDeviceObj.deviceName;
    var s = sql.deviceSQL.modifyDeviceName(deviceName, userId, deviceId);
    sql.execute(s, function (err) {
        if (err) {
            console.log(err);
        } else {
            deferred.resolve({status: 'success', code: 1, msg: '更改设备名成功...'});
        }
    });
    return deferred.promise;
};

/**
 * 设备报警开关
 * @param userDeviceObj
 * @returns {promise|Q.promise}
 */
exports.switchDeviceAlarm = function (userDeviceObj) {
    var deferred = Q.defer();
    var userId = userDeviceObj.userId;
    var deviceId = userDeviceObj.deviceId;
    var isAlarmOpen = userDeviceObj.isAlarmOpen;
    var s = sql.deviceSQL.switchDeviceAlarm(userId, deviceId, isAlarmOpen);
    sql.execute(s, function (err) {
        if (err) {
            console.log(err);
        } else {
            var msg = '报警设置为：';
            if (isAlarmOpen == 1) {
                msg += '打开'
            } else {
                msg += '关闭'
            }
            deferred.resolve({status: 'success', code: 1, msg: msg});
        }
    });
    return deferred.promise;
};