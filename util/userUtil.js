var sql = require('./sql');
var Q = require('q');

/**
 * 判断账号类型，email or phone
 * @param userId
 * @returns {*}
 */
var typeOfUserId = function (userId) {
    var emailReg = /^([a-zA-Z0-9]+[_|_|\.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|\_|\.|\.]?)*[a-zA-Z0-9]+\.[a-zA-Z]{2,4}$/,
        phoneReg = /^1[3|4|5|8][0-9]\d{4,8}$/,
        result;
    if (emailReg.test(userId)) {
        result = 'email';
    } else if (phoneReg.test(userId)) {
        result = 'phone';
    } else {
        result = 'type error';
    }
    return result;
};

exports.typeOfUserId = function (userId) {
    return typeOfUserId(userId);
};

exports.getUserIdByUserName = function (username) {
    var deferred = Q.defer();
    var type = typeOfUserId(username);
    var s = sql.userSQL.getUserIdByUserName(username, type);
    sql.execute(s, function (err, rows) {
        if (err) {
            console.log(err);
            deferred.reject({status: 'error', code: 501, msg: err});
        } else {
            deferred.resolve(rows[0]._id);
        }
    })
    return deferred.promise;
}

/**
 * 验证用户信息
 * @param username
 * @param password
 * @returns {promise|Q.promise}
 */
exports.validUser = function (username, password) {
    var deferred = Q.defer();
    var type = typeOfUserId(username);
    if (username && password) {
        var s = sql.userSQL.validUser(username, type);
        sql.execute(s, function (err, rows) {
            if (err) {
                console.log(err);
                deferred.reject({status: 'error', code: 501, msg: err});
            } else {
                if (rows.length === 1) {
                    if (rows[0].password === password) {
                        if (rows[0].activation_date === 0) {
                            deferred.reject({status: 'error', code: 404, msg: '此账户尚未激活...'});
                        } else {
                            deferred.resolve(rows[0]);
                        }
                    } else {
                        deferred.reject({status: 'error', code: 403, msg: '密码错误...'});
                    }
                } else {
                    deferred.reject({status: 'error', code: 402, msg: '用户名错误...'});
                }
            }
        });
    } else {
        //用户名或密码为空，直接返回false
        deferred.reject({status: 'error', code: 401, msg: '用户名或密码为空,验证无法通过...'});
    }
    return deferred.promise;
};

/**
 * 设置登录时间
 * @param userObj
 * @returns {promise|Q.promise}
 */
exports.setLoginTime = function (userObj) {
    var deferred = Q.defer();
    var id = userObj._id
    var s = sql.userSQL.setLoginTime(new Date().getTime(), id);
    sql.execute(s, function (err) {
        if (err) {
            console.log(err);
        }
    });
    deferred.resolve(userObj);
    return deferred.promise;
};

/**
 * 验证用户是否已存在
 * @param userId
 * @returns {promise|Q.promise}
 */
exports.userIsExist = function (username) {
    var deferred = Q.defer();
    var type = typeOfUserId(username);
    var s = sql.userSQL.getUserIdByUserName(username, type);
    sql.execute(s, function (err, rows) {
        if (err) {
            console.log(err);
            deferred.reject({status: 'error', code: 501, msg: err});
        } else {
            deferred.resolve(rows[0]);
        }
    });
    return deferred.promise;
};

/**
 * 创建用户
 * @param userObj
 * @returns {promise|Q.promise}
 */
exports.createUser = function (userObj) {
    var deferred = Q.defer();
    var userName = userObj.userId;
    var password = userObj.password;
    var type = typeOfUserId(userName);
    var time = new Date().getTime();
    var s = sql.userSQL.createUser(userName, password, type, time);
    sql.execute(s, function (err, rows) {
        if (err) {
            console.log(err);
            deferred.reject({status: 'error', code: 501, msg: err});
        } else {
            userObj._id = rows.insertId;
            deferred.resolve(userName);
        }
    });
    return deferred.promise;
};

/**
 * 发送激活账号邮件或短信
 * @param userId
 * @returns {promise|Q.promise}
 */
exports.sendActivationMessage = function (userName) {
    var deferred = Q.defer();
    var e;
    var type = typeOfUserId(userName);
    var s;
    if (type === 'email') {
        e = require('MD5')(Math.random());
        s = sql.userSQL.sendActivationMessage(userName, e, type);
        sql.execute(s, function (err) {
            if (err) console.log(err);
        });
        var transport = require('../util/mail').transport;
        var url = 'http://115.29.179.7/mobile/user/activation?e=' + e + '&userId=' + userName;
        var mailOptions = {
            from: '皇上<dreamjl@live.cn>', // sender address
            to: userName, // list of receivers
            subject: '激活账户', // Subject line
            text: '激活账户', // plaintext body
            html: '<a href="' + url + '">点此激活您的账户</a>' // html body
        };
        transport.sendMail(mailOptions, function (err, response) {
            if (err) {
                console.log(err);
            } else {
                console.log("Message sent: " + response.message);
            }
        });
        deferred.resolve('email');
    } else if (type === 'phone') {
        var SMS = require('./smsbao').SMS;
        e = Math.floor((Math.random() * 9 + 1) * 100000);
        s = sql.userSQL.sendActivationMessage(userName, e, type);
        sql.execute(s, function (err) {
            if (err) {
                console.log(err);
            }
        });
        var content = '欢迎注册乐屋安全卫士，您的验证码为：' + e;
        SMS(userName, content);
        deferred.resolve('phone');
    }
    return deferred.promise;
};

/**
 * 激活用户
 * @param userId
 * @param e
 * @returns {promise|Q.promise}
 */
exports.activateUser = function (userName, e) {
    var deferred = Q.defer();
    var type = typeOfUserId(userName);
    var time = new Date().getTime();
    var s = sql.userSQL.activateUser(userName, e, time, type);
    sql.execute(s, function (err, rows) {
        if (err) {
            console.log(err);
            deferred.reject({status: 'error', code: 501, msg: err});
        } else {
            if (rows.changedRows >= 1) {
                deferred.resolve({status: 'success', code: 1, msg: '用户激活成功...'})
            } else {
                deferred.reject({status: 'error', code: 1, msg: '链接失效或用户已被激活...'});
            }
        }
    });
    return deferred.promise;
};

/**
 * 修改密码
 * @param userObj
 * @returns {promise|Q.promise}
 */
exports.modifyPassword = function (userObj) {
    console.log(userObj);
    var userId = userObj.userId;
    var passwordNew = userObj.passwordNew;
    var deferred = Q.defer();
    var s = sql.userSQL.modifyPassword(userId, passwordNew);
    sql.execute(s, function (err, rows) {
        if (err) {
            console.log(err);
            deferred.reject({status: 'error', code: 501, msg: err});
        } else {
            deferred.resolve({status: 'success', code: 1, msg: '修改密码成功...'});
            var socketUtil = require('./socketUtil');
            var protobuf = require('./protobuf');
            var msg = {};
            msg.from = 'server';
            msg.to = userId;
            msg.cmd = 10;
            protobuf.sendMessageToClientsByUserId(userId, msg);
        }
    });
    return deferred.promise;
};

/**
 * 忘记密码生成随机验证码
 * @param userId
 * @returns {promise|Q.promise}
 */
exports.sendPIN = function (userName) {
    var deferred = Q.defer();
    var type = typeOfUserId(userName);
    var e = Math.floor((Math.random() * 9 + 1) * 100000);
    var time = new Date().getTime();
    if (type === 'email') {
        var transport = require('../util/mail').transport;
        var mailOptions = {
            from: '皇上<dreamjl@live.cn>', // sender address
            to: userName, // list of receivers
            subject: '重置密码', // Subject line
            text: '重置密码', // plaintext body
            html: '<p>您申请重置密码的验证码为：' + e + '。乐屋安全卫士，如果非本人操作请致电客服。</p>' // html body
        };
        transport.sendMail(mailOptions, function (err, response) {
            if (err) {
                console.log(err);
                deferred.reject({status: 'error', code: 501, msg: err});
            } else {
                console.log("Message sent: " + response.message);
                deferred.resolve({status: 'success', code: 1, msg: e});
            }
        });
    } else if (type === 'phone') {
        var SMS = require('./smsbao').SMS;
        var content = '您申请重置密码的验证码为：' + e + '。乐屋安全卫士，如果非本人操作请致电客服。';
        SMS(userName, content);
        deferred.resolve({status: 'success', code: 2, msg: e});
    }
    var s = sql.userSQL.sendPIN(time, e, type, userName);
    sql.execute(s, function (err) {
        if (err) {
            console.log(err);
        }
    });
    return deferred.promise;
};

/**
 * 校验验证码
 * @param userId
 * @param e
 * @returns {promise|Q.promise}
 */
exports.validPIN = function (userName, e) {
    var deferred = Q.defer();
    var type = typeOfUserId(userName);
    var s = sql.userSQL.validPIN(userName, e, type);
    if (userName && e) {
        sql.execute(s, function (err, rows) {
            if (err) {
                console.log(err);
                deferred.reject({status: 'error', code: 501, msg: err});
            } else {
                if (rows.length === 1) {
                    deferred.resolve(rows[0]._id);
                } else {
                    deferred.reject({status: 'error', code: 1, msg: '验证码有误...'});
                }
            }
        });
    }
    return deferred.promise;
};