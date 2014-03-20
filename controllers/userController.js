var userService = require('../services/userService');

/**
 * 用户登陆
 * @param  {string} userId   用户名
 * @param  {string} password 密码
 */
exports.login = function (req, res) {

    var userId = req.body.userId || req.param('userId'),
        password = req.body.password || req.param('password');

    userService.login(userId, password)
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
 * 用户注册
 * @param  {string} userId   用户名
 * @param  {string} password 密码
 */
exports.signup = function (req, res) {

    var userId = req.body.userId || req.param('userId'),
        password = req.body.password || req.param('password');

    userService.signup(userId, password)
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
 * 发送激活信息
 * @param  {string} userId   用户名
 */
exports.sendActivationMessage = function (req, res) {

    var userId = req.body.userId || req.param('userId');

    userService.sendActivationMessage(userId)
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
 * 激活账户
 * @param  {string} userId   用户名
 * @param  {string} e        激活码
 */
exports.activateUser = function (req, res) {

    var userId = req.body.userId || req.param('userId');
    var e = req.body.e || req.param('e');

    userService.activateUser(userId, e)
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
 * 修改密码
 * @param  {string} userId      用户名
 * @param  {string} password    原始密码
 * @param  {string} passwordNew 新密码
 */
exports.modifyPassword = function (req, res) {

    var userId = req.body.userId || req.param('userId'),
        password = req.body.password || req.param('password'),
        passwordNew = req.body.passwordNew || req.param('passwordNew');

    userService.modifyPassword(userId, password, passwordNew)
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
 * 忘记密码
 * @param  {string} userId      用户名
 */
exports.forgetPassword = function (req, res) {

    var userId = req.body.email || req.param('userId');

    userService.forgetPassword(userId)
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
 * 忘记密码后的修改密码
 * @param  {string} userId      用户名
 * @param  {string} e           认证码
 * @param  {string} passwordNew 新密码
 */
exports.resetPassword = function (req, res) {

    var userId = req.body.userId || req.param('userId'),
        e = req.body.e || req.param('e'),
        passwordNew = req.body.passwordNew || req.param('passwordNew');

    userService.resetPassword(userId, e, passwordNew)
        .then(function (data) {
            res.send(data);
        })
        .catch(function (error) {
            // Handle any error from all above steps
            console.log(error);
            res.send(error);
        });

};