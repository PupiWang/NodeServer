var alarmService = require('../services/alarmService');

/**
 * 获取历史告警
 * @param  {string} userId   用户名
 * @param  {string} password 密码
 * @param  {string} time     指定获取哪个时间段之后的
 */
exports.getHistoryAlarm = function (req, res) {

    var userId = req.body.userId || req.param('userId'),
        password = req.body.password || req.param('password'),
        time = req.body.time || req.param('time');

    alarmService.getHistoryAlarm(userId, password, time)
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
 * 设置告警记录
 * @param  {string} userId   用户名
 * @param  {string} password 密码
 * @param  {string} recordId 告警记录Id
 */
exports.readHistoryAlarm = function (req, res) {

    var userId = req.body.userId || req.param('userId'),
        password = req.body.password || req.param('password'),
        recordId = req.body.recordId || req.param('recordId');

    alarmService.readHistoryAlarm(userId, password, recordId)
        .then(function (data) {
            res.send(data);
        })
        .catch(function (error) {
            // Handle any error from all above steps
            console.log(error);
            res.send(error);
        });

};