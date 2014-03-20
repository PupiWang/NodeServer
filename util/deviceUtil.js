var sql = require('./sql');
var Q = require('q');

/**
 * 获取设备列表
 * @param userObj
 * @returns {promise|Q.promise}
 */
exports.getDevicesByUser = function (userObj) {
    var deferred = Q.defer();
    var s = 'select * from user_device ud, device d ' +
        'where ud.id_device = d.id_device AND ud.id_user = ' + userObj._id;
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
 * 设备号检查
 * @param userDeviceObj
 * @returns {promise|Q.promise}
 */
exports.isDeviceExist = function (userDeviceObj) {
    var deferred = Q.defer();
    var deviceId = userDeviceObj.deviceId;
    //设备号是否存在
    var s = 'select * from device where id_device = "' + deviceId + '"';
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
    var userId = userDeviceObj.userId;
    var deviceId = userDeviceObj.deviceId;
    //检查用户是否绑定过此设备
    var s = 'select * from user_device ud where ud.id_device = "' + deviceId + '"';
    sql.execute(s, function (err, rows) {
        if (err) {
            console.log(err);
            deferred.reject({status: 'error', code: 501, msg: err});
        } else {
            if (rows.length >= 1) {
                deferred.reject({status: 'error', code: 2, msg: '已经绑定了该设备，无法重复绑定...'});
            } else {
                deferred.resolve(userId);
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
    var s = 'select * from user_device ud where ud.id_user = "' + userId + '" and ud.id_device = "' + deviceId + '"';
    sql.execute(s, function (err, rows) {
        if (err) {
            console.log(err);
            deferred.reject({status: 'error', code: 501, msg: err});
        } else {
            if (rows.length >= 1) {
                deferred.reject({status: 'error', code: 2, msg: '已经绑定了该设备，无法重复绑定...'});
            } else {
                deferred.resolve(userId);
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
    var s = 'insert into user_device (id_user,id_device,display_name,isadmin) VALUES ("' +
        userId + '","' + deviceId + '","' + deviceId + '",1)';
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
    var s = 'insert into user_device (id_user,id_device,display_name,isadmin) VALUES ("' +
        userId + '","' + deviceId + '","' + deviceId + '",0)';
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
 * 为设备添加移除用户
 * @param userDeviceObj
 * @returns {promise|Q.promise}
 */
exports.deleteUserForDevice = function (userDeviceObj) {
    var deferred = Q.defer();
    var userId = userDeviceObj.userId;
    var deviceId = userDeviceObj.deviceId;
    //绑定设备
    var s = 'delete from user_device where id_user = "' + userId + '" and id_device = "' + deviceId + '"';
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
    var s = 'UPDATE user_device SET display_name = "' + deviceName + '" WHERE id_user = "' + userId + '" AND id_device = "' + deviceId + '"';
    sql.execute(s, function (err, rows, fields) {
        if (err) {
            console.log(err);
        } else {
            deferred.resolve({status: 'success', code: 1, msg: '更改设备名成功...'});
        }
    });
    return deferred.promise;
};