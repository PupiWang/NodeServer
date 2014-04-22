var deviceService = require('../services/deviceService');

/**
 * 获取用户关联设备
 * @param userId     用户名
 * @param password   密码
 */
exports.getDevicesByUser = function (req, res) {

    var userId = req.body.userId || req.param('userId'),
        password = req.body.password || req.param('password');

    deviceService.getDevicesByUser(userId, password)
        .then(function (data) {
            res.send(data);
        })
        .catch(function (error) {
            // Handle any error from all above steps
            console.log(error);
            res.send(error);
        });

};

/**
 * 获取设备关联的普通用户
 * @param userId     用户名
 * @param password   密码
 * @param deviceId   设备号
 */
exports.getUsersByDevice = function (req, res) {

    var userId = req.body.userId || req.param('userId'),
        password = req.body.password || req.param('password'),
        deviceId = req.body.deviceId || req.param('deviceId');

    deviceService.getUsersByDevice(userId, password, deviceId)
        .then(function (data) {
            res.send(data);
        })
        .catch(function (error) {
            // Handle any error from all above steps
            console.log(error);
            res.send(error);
        });

};

/**
 * 为新设备绑定管理员
 * @param userId    用户名
 * @param password  密码
 * @param deviceId  设备号
 */
exports.bindingAdmin = function (req, res) {

    var userId = req.body.userId || req.param('userId'),
        password = req.body.password || req.param('password'),
        deviceId = req.body.deviceId || req.param('deviceId');

    deviceService.bindingAdmin(userId, password, deviceId)
        .then(function (data) {
            res.send(data);
        })
        .catch(function (error) {
            // Handle any error from all above steps
            console.log(error);
            res.send(error);
        });

};

/**
 * 管理员为设备添加用户
 * @param userId    管理员用户名
 * @param password  管理员密码
 * @param userIdNew 新用户用户名
 * @param deviceId  设备号
 */
exports.bindingUser = function (req, res) {

    var userId = req.body.userId || req.param('userId'),
        password = req.body.password || req.param('password'),
        userIdNew = req.body.userIdNew || req.param('userIdNew'),
        deviceId = req.body.deviceId || req.param('deviceId');

    deviceService.bindingUser(userId, password, userIdNew, deviceId)
        .then(function (data) {
            res.send(data);
        })
        .catch(function (error) {
            // Handle any error from all above steps
            console.log(error);
            res.send(error);
        });

};

/**
 * 管理员为设备移除用户
 * @param userId    管理员用户名
 * @param password  管理员密码
 * @param userIdNew 要移除用户的用户名
 * @param deviceId  设备号
 */
exports.removeUser = function (req, res) {

    var userId = req.body.userId || req.param('userId'),
        password = req.body.password || req.param('password'),
        userIdNew = req.body.userIdNew || req.param('userIdNew'),
        deviceId = req.body.deviceId || req.param('deviceId');

    deviceService.removeUser(userId, password, userIdNew, deviceId)
        .then(function (data) {
            res.send(data);
        })
        .catch(function (error) {
            // Handle any error from all above steps
            console.log(error);
            res.send(error);
        });

};

/**
 * 修改设备名
 * @param userId        用户名
 * @param password      密码
 * @param deviceName    设备名
 * @param deviceId      设备号
 */
exports.modifyDeviceName = function (req, res) {

    var userId = req.body.userId || req.param('userId'),
        password = req.body.password || req.param('password'),
        deviceName = req.body.deviceName || req.param('deviceName'),
        deviceId = req.body.deviceId || req.param('deviceId');

    deviceService.modifyDeviceName(userId, password, deviceName, deviceId)
        .then(function (data) {
            res.send(data);
        })
        .catch(function (error) {
            // Handle any error from all above steps
            console.log(error);
            res.send(error);
        });

};

/**
 * 设备报警开关
 * @param userId        用户名
 * @param password      密码
 * @param deviceId      设备号
 */
exports.switchDeviceAlarm = function (req, res) {

    var userId = req.body.userId || req.param('userId'),
        password = req.body.password || req.param('password'),
        deviceId = req.body.deviceId || req.param('deviceId'),
        isAlarmOpen = req.body.isAlarmOpen || req.param('isAlarmOpen');

    deviceService.switchDeviceAlarm(userId, password, deviceId, isAlarmOpen)
        .then(function (data) {
            res.send(data);
        })
        .catch(function (error) {
            // Handle any error from all above steps
            console.log(error);
            res.send(error);
        });

};