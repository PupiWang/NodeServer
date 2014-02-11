var Q = require('q');
var sql = require('../util/sql');
var userUtil = require('../util/userUtil');
var validUser = userUtil.validUser;
var typeOfUserId = userUtil.typeOfUserId;
var sendActivationMessage = userUtil.sendActivationMessage;
/**
 * 用户登陆
 * @param  {string} email    邮箱
 * @param  {string} password 密码
 */
exports.login = function (req, res) {

  var userId = req.body.userId || req.param('userId'),
    password = req.body.password || req.param('password');

  var type = typeOfUserId(userId);

  validUser(userId, password)
    .then(function () {
      //验证通过
      var deferred = Q.defer();
      var s;
      //最近登陆时间
      if (type === 'email') {
        s = 'UPDATE user SET datetime_lastlogin = ' + new Date().getTime() + ' WHERE email = "' + userId + '"';
      } else if (type === 'phone') {
        s = 'UPDATE user SET datetime_lastlogin = ' + new Date().getTime() + ' WHERE phone = "' + userId + '"';
      }
      sql.execute(s, function (err) {
        if (err) {
          console.log(err);
        }
      });
      deferred.resolve({status: 'success', code: 1, msg: '验证通过...'});
      return deferred.promise;
    })
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

/**
 * 用户注册
 * @param  {string} userId 用户唯一标识，邮箱或者手机号码
 * @param  {string} password 密码
 */
exports.signup = function (req, res) {

  // var email = req.body.email || req.param('email'),
  var userId = req.body.userId || req.param('userId'),
    password = req.body.password || req.param('password');

  var type = typeOfUserId(userId);

  if (type === 'type error') {
    res.send(type);
    return;
  }

  /**
   * 验证用户是否已存在
   */
  var userIsExist = function () {

    var deferred = Q.defer();
    var s;
    if (type === 'email') {
      s = 'select * from user where email = "' + userId + '"';
    } else if (type === 'phone') {
      s = 'select * from user where phone = "' + userId + '"';
    }

    //判断用户名密码是否为空
    if (!userId || !password) {
      deferred.reject({status: 'error', code: 1, msg: '资料填写不完整...'});
    }

    sql.execute(s, function (err, rows) {
      if (err) {
        console.log(err);
        deferred.reject({status: 'error', code: 501, msg: err});
      } else {
        if (rows.length >= 1) {
          deferred.reject({status: 'error', code: 3, msg: '用户名已存在'});
        } else {
          deferred.resolve();
        }
      }
    });

    return deferred.promise;
  };

  /**
   * 创建用户
   */
  var createUser = function () {
    var deferred = Q.defer();
    var time = new Date().getTime();
    var s;

    if (type === 'email') {
      s = 'insert into user (email,password,datetime_signup,datetime_lastlogin) VALUES ("' +
        userId + '","' + password + '",' + time + ',' + time + ')';
    } else if (type === 'phone') {
      s = 'insert into user (phone,password,datetime_signup,datetime_lastlogin) VALUES ("' +
        userId + '","' + password + '",' + time + ',' + time + ')';
    }

    sql.execute(s, function (err) {
      if (err) {
        console.log(err);
        deferred.reject({status: 'error', code: 501, msg: err});
      } else {
        deferred.resolve();
      }
    });
    return deferred.promise;
  };

  userIsExist()
    .then(createUser())
    .then(sendActivationMessage(userId))
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

exports.sendActivationMessage = function (req, res) {
  var userId = req.body.userId || req.param('userId');
  sendActivationMessage(userId)
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

exports.activation = function (req, res) {
  var e = req.body.e || req.param('e');
  var s = 'UPDATE user SET activation_date = ' + new Date().getTime() +
      ' , activation_e = "" WHERE activation_e = "' + e + '"';
  sql.execute(s, function (err, rows) {
    if (err) {
      console.log(err);
      res.send({status: 'error', code: 501, msg: err});
    } else {
      if (rows.changedRows >= 1) {
        res.send({status: 'success', code: 1, msg: '用户已激活...'});
      } else {
        res.send({status: 'error', code: 1, msg: '链接失效或用户已被激活...'});
      }
    }
  });
};

/**
 * 修改密码
 * @param  {string} userId 用户名
 * @param  {string} password 密码
 * @param  {string} passwordNew 新密码
 */
exports.modify = function (req, res) {

  var userId = req.body.userId || req.param('userId'),
    password = req.body.password || req.param('password'),
    passwordNew = req.body.passwordNew || req.param('passwordNew');

  validUser(userId, password)
    .then(function () {
      //验证通过
      var deferred = Q.defer();
      var type = typeOfUserId(userId);
      var s;

      if (type === 'email') {
        s = 'UPDATE `user` SET `password` = "' + passwordNew + '" WHERE `email` = "' + userId + '"';
      } else if (type === 'phone') {
        s = 'UPDATE `user` SET `password` = "' + passwordNew + '" WHERE `phone` = "' + userId + '"';
      }

      sql.execute(s, function (err, rows) {
        if (err) {
          console.log(err);
          deferred.reject({status: 'error', code: 501, msg: err});
        } else {
          if (rows.changedRows >= 1) {
            deferred.resolve({status: 'success', code: 1, msg: '修改密码成功...'});
          } else {
            deferred.reject({status: 'error', code: 601, msg: '修改密码失败...'});
          }
        }
      });
      return deferred.promise;
    })
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

/**
 * 忘记密码
 * @param  {string} email 注册用户的邮箱
 */
exports.forget = function (req, res) {

  var userId = req.body.email || req.param('userId');

  var userIsExist = function () {
    //判断用户名是否正确
    var deferred = Q.defer();
    var type = typeOfUserId(userId);
    var s;

    if (type === 'email') {
      s = 'select * from user where email = "' + userId + '"';
    } else if (type === 'phone') {
      s = 'select * from user where phone = "' + userId + '"';
    }

    sql.execute(s, function (err, rows) {
      if (err) {
        console.log(err);
        deferred.reject({status: 'error', code: 501, msg: err});
      } else {
        if (rows.length >= 1) {
          deferred.resolve();
        } else {
          deferred.reject({status: 'error', code: 1, msg: '该用户不存在'});
        }
      }
    });

    return deferred.promise;
  };

  userIsExist()
    .then(function () {
      //设置唯一字段rstpwd_e，生效时间字段rstpwd_time，是否生效字段rstpwd_valid
      //e用以确定链接的真实性，time用以确定链接是否因超时而失效，valid在链接第一次被访问后设置为0
      //用来构造一次性链接，点击后失效
      var deferred = Q.defer();
      var type = typeOfUserId(userId);
      var MD5 = require('MD5');
      var e = MD5(Math.random());
      var time = new Date().getTime();
      var s;

      if (type === 'email') {
        s = 'UPDATE `user` SET `rstpwd_e` = "' + e + '" , `rstpwd_time` = "' + time +
          '" , `rstpwd_valid` = "1" ' + 'WHERE `email` = "' + userId + '"';
      } else if (type === 'phone') {
        s = 'UPDATE `user` SET `rstpwd_e` = "' + e + '" , `rstpwd_time` = "' + time +
          '" , `rstpwd_valid` = "1" ' + 'WHERE `phone` = "' + userId + '"';
      }

      sql.execute(s, function (err, rows) {
        if (err) {
          console.log(err);
          deferred.reject({status: 'error', code: 501, msg: err});
        } else {
          if (rows.changedRows >= 1) {
            deferred.resolve(e);
          } else {
            deferred.reject({status: 'error', code: 601, msg: '操作失败...'});
          }
        }
      });

      return deferred.promise;
    })
    .then(function (data) {
      //发送带重置密码链接的邮件
      var deferred = Q.defer();
      var type = typeOfUserId(userId);
      var transport = require('../util/mail').transport;
      if (type === 'email') {
        var url = 'http://115.29.179.7/mobile/user/reset?e=' + data;
        var mailOptions = {
          from: '皇上<dreamjl@live.cn>', // sender address
          to: userId, // list of receivers
          subject: '重置密码', // Subject line
          text: '重置密码', // plaintext body
          html: '<a href="' + url + '">点此重置您的密码</a>' // html body
        };
        transport.sendMail(mailOptions, function (err, response) {
          if (err) {
            console.log(err);
            deferred.reject({status: 'error', code: 501, msg: err});
          } else {
            console.log("Message sent: " + response.message);
            deferred.resolve({status: 'success', code: 1, msg: '重置密码的链接已发送到您的邮箱...'});
          }
        });
      } else if (type === 'phone') {
        deferred.resolve({status: 'success', code: 2, msg: '验证码已发送到您的手机...'});
      }

      return deferred.promise;
    })
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

exports.reset = function (req, res) {
  //重置密码，判断URL有效性
  var e = req.body.e || req.param('e');

  var validURL = function (e, time) {
    var deferred = Q.defer();
    var s = 'select * from user where rstpwd_e = "' + e + '"';

    sql.execute(s, function (err, rows) {
      if (err) {
        console.log(err);
        deferred.reject({status: 'error', code: 501, msg: err});
      } else {
        if (rows.length >= 1) {
          var data = rows[0];
          if (data.rstpwd_valid !== 1) {
            deferred.reject({status: 'error', code: 2, msg: '链接已失效...'});
          } else if ((time - data.rstpwd_time) > 60 * 60 * 1000) {
            deferred.reject({status: 'error', code: 3, msg: '链接已过期...'});
          } else {
            deferred.resolve();
          }
        } else {
          deferred.reject({status: 'error', code: 1, msg: '链接不合法，请使用邮件中提供的有效链接...'});
        }
      }
    });
    return deferred.promise;
  };

  validURL(e, new Date().getTime())
    .then(function () {
      //将rstpwd_valid字段设置为0
      var deferred = Q.defer();
      var s = 'UPDATE `user` SET `rstpwd_valid` = 0' + ' WHERE `rstpwd_e` = "' + e + '"';
      sql.execute(s, function (err, rows) {
        if (err) {
          console.log(err);
          deferred.reject({status: 'error', code: 501, msg: err});
        } else {
          if (rows.changedRows >= 1) {
            deferred.resolve({status: 'success', code: 1, msg: '链接有效性验证通过...'});
          } else {
            deferred.reject({status: 'error', code: 601, msg: '操作失败...'});
          }
        }
      });
      return deferred.promise;
    })
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

exports.resetPassword = function (req, res) {

  var userId = req.body.userId || req.param('userId'),
    passwordNew = req.body.passwordNew || req.param('passwordNew'),
    e = req.body.e || req.param('e');

  var modifyPassword = function (userId, passwordNew) {
    var deferred = Q.defer();
    var type = typeOfUserId(userId);
    var s;

    if (type === 'email') {
      s = 'UPDATE `user` SET `password` = "' + passwordNew + '" , `rstpwd_e` = "" WHERE `email` = "' +
        userId + '" AND `rstpwd_e` = "' + e + '"';
    } else if (type === 'phone') {
      s = 'UPDATE `user` SET `password` = "' + passwordNew + '" , `rstpwd_e` = "" WHERE `phone` = "' +
        userId + '" AND `rstpwd_e` = "' + e + '"';
    }

    sql.execute(s, function (err, rows) {
      if (err) {
        console.log(err);
        deferred.reject({status: 'error', code: 501, msg: err});
      } else {
        if (rows.changedRows >= 1) {
          deferred.resolve({status: 'success', code: 1, msg: '修改密码成功...'});
        } else {
          deferred.reject({status: 'error', code: 1, msg: '修改密码失败，原因：特征值不匹配或链接已失效...'});
        }
      }
    });
    return deferred.promise;
  };

  modifyPassword(userId, passwordNew)
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