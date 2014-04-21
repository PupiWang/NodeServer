var Q = require('q');
var sql = require('../util/sql');
var userUtil = require('../util/userUtil');

/**
 * 用户登陆
 * @param  {string} userId   用户名
 * @param  {string} password 密码
 */
exports.login = function (userId, password) {

    var serviceDeferred = Q.defer();

    userUtil.validUser(userId, password)
        .then(userUtil.setLoginTime)
        .then(function (data) {
            // Success
            var res = {
                _id : data._id,
                phone : data.phone,
                email : data.email,
                datetime_lastlogin : data.datetime_lastlogin,
                status : 'success',
                code   : 1,
                msg    : '验证通过...'
            };
            serviceDeferred.resolve(res);
        })
        .catch(function (error) {
            // Handle any error from all above steps
            serviceDeferred.reject(error);
        });

    return serviceDeferred.promise;
};

/**
 * 用户注册
 * @param  {string} userId   用户名
 * @param  {string} password 密码
 */
exports.signup = function (userId, password) {

    var serviceDeferred = Q.defer();

    userUtil.userIsExist(userId)
        .then(function (data) {
            var deferred = Q.defer();
            if (data) {
                deferred.reject({status: 'error', code: 3, msg: '用户名已存在'});
            } else {
                var userObj = {
                    userId : userId,
                    password : password
                };
                deferred.resolve(userObj);
            }
            return deferred.promise;
        })
        .then(userUtil.createUser)
        .then(userUtil.sendActivationMessage)
        .then(function (data) {
            //成功返回结果
            var res;
            if (data === 'email') {
                res = {
                    status: 'success',
                    code: 1,
                    msg: '注册成功,已发送激活邮件...'
                }
            } else {
                res = {
                    status: 'success',
                    code: 2,
                    msg: '注册成功,已发送验证码到您的手机...'
                }
            }
            serviceDeferred.resolve(res);
        })
        .catch(function (error) {
            // Handle any error from all above steps
            console.log('error : ' + error);
            serviceDeferred.reject(error);
        });

    return serviceDeferred.promise;

};

/**
 * 发送激活信息
 * @param  {string} userId   用户名
 */
exports.sendActivationMessage = function (userId) {

    var serviceDeferred = Q.defer();

    userUtil.sendActivationMessage(userId)
        .then(function (data) {
            //成功返回结果
            var res;
            if (data === 'email') {
                res = {
                    status: 'success',
                    code: 1,
                    msg: '注册成功,已发送激活邮件...'
                }
            } else {
                res = {
                    status: 'success',
                    code: 2,
                    msg: '注册成功,已发送验证码到您的手机...'
                }
            }
            serviceDeferred.resolve(res);
        })
        .catch(function (error) {
            // Handle any error from all above steps
            console.log('error : ' + error);
            serviceDeferred.reject(error);
        });

    return serviceDeferred.promise;

};

/**
 * 激活账户
 * @param  {string} userId   用户名
 * @param  {string} e        激活码
 */
exports.activateUser = function (userId, e) {

    var serviceDeferred = Q.defer();

    userUtil.activateUser(userId, e)
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
 * 修改密码
 * @param  {string} userId      用户名
 * @param  {string} password    原始密码
 * @param  {string} passwordNew 新密码
 */
exports.modifyPassword = function (userId, password, passwordNew) {

    var serviceDeferred = Q.defer();

    userUtil.validUser(userId, password)
        .then(function (data) {
            var deferred = Q.defer();
            deferred.resolve({
                userId : data._id,
                passwordNew:passwordNew
            });
            return deferred.promise;
        })
        .then(userUtil.modifyPassword)
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
 * 忘记密码
 * @param  {string} userId      用户名
 */
exports.forgetPassword = function (userId) {

    var serviceDeferred = Q.defer();

    userUtil.userIsExist(userId)
        .then(function (data) {
            var deferred = Q.defer();
            if (data) {
                deferred.resolve(userId);
            } else {
                deferred.reject({status: 'error', code: 1, msg: '该用户不存在'});
            }
            return deferred.promise;
        })
        .then(userUtil.sendPIN)
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
 * 忘记密码后的修改密码
 * @param  {string} userId      用户名
 * @param  {string} e           认证码
 * @param  {string} passwordNew 新密码
 */
exports.resetPassword = function (userId, e, passwordNew) {

    var serviceDeferred = Q.defer();

    userUtil.validPIN(userId, e)
        .then(function (_id) {
            var deferred = Q.defer();
            deferred.resolve({
                userId : _id,
                passwordNew : passwordNew
            });
            return deferred.promise;
        })
        .then(userUtil.modifyPassword)
        .then(function (data) {
            //成功返回结果
            var type = userUtil.typeOfUserId(userId)
            var s = sql.userSQL.resetE(e, userId, type);
            sql.execute(s, function (err) {
                if (err) {
                    console.log(err);
                }
            });

            serviceDeferred.resolve(data);
        })
        .catch(function (error) {
            // Handle any error from all above steps
            serviceDeferred.reject(error);
        });

    return serviceDeferred.promise;

};