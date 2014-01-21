var sql = require('../util/sql');
var validUser = require('../util/userUtil').validUser;
var Q = require('q');
/**
 * 用户登陆
 * @param  {string} email    邮箱
 * @param  {string} password 密码
 */
exports.login = function (req, res) {

  var email = req.body.email || req.param('email'),
    password = req.body.password || req.param('password');

  validUser(email, password)
    .then(function (data) {
      //验证通过
      var deferred = Q.defer();
      //最近登陆时间
      var s = 'UPDATE user SET datetime_lastlogin = ' + new Date().getTime() + ' WHERE email = "' + email + '"';
      sql.execute(s, function (err, rows, fields) {
        if (err) {
          console.log(err);
          deferred.reject({status: 'error', code: 501, msg: err});
        } else {
          deferred.resolve({status: 'success', code: 1, msg: '验证成功，跳转中...'});
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
 * 用户注册
 * @param  {string} email 注册用户的邮箱
 * @param  {string} password 密码
 */
exports.signup = function (req, res) {

  var email = req.body.email || req.param('email'),
    password = req.body.password || req.param('password');

  var userIsExist = function (email) {

    var deferred = Q.defer();
    var s = 'select * from user where email = "' + email + '"';

    sql.execute(s, function (err, rows, fields) {
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

  userIsExist(email)
    .then(function (data) {
      var deferred = Q.defer();
      var time = new Date().getTime();
      var MD5 = require('MD5');
      var e = MD5(Math.random());
      var s = 'insert into user (email,password,datetime_signup,datetime_lastlogin,activation_e) VALUES ("' +
        email + '","' + password + '",' + time + ',' + time + ',"' + e + '")';

      //判断用户名密码是否为空
      if (!email || !password) {
        deferred.reject({status: 'error', code: 1, msg: '资料填写不完整...'});
      }

      sql.execute(s, function (err, rows, fields) {
        if (err) {
          console.log(err);
          deferred.reject({status: 'error', code: 501, msg: err});
        } else {
          deferred.resolve(e);
        }
      });
      return deferred.promise;
    })
    .then(function (data) {
      var deferred = Q.defer();
      var transport = require('../util/mail').transport;
      var url = 'http://115.29.179.7/mobile/user/activation?e=' + data;
      var mailOptions = {
        from: '皇上<dreamjl@live.cn>', // sender address
        to: email, // list of receivers
        subject: '激活账户', // Subject line
        text: '激活账户', // plaintext body
        html: '<a href="' + url + '">点此激活您的账户</a>' // html body
      };
      transport.sendMail(mailOptions, function (err, response) {
        if (err) {
          console.log(err);
          deferred.reject({status: 'error', code: 501, msg: err});
        } else {
          console.log("Message sent: " + response.message);
        }
      });
      deferred.resolve({status: 'success', code: 1, msg: '注册成功,已发送激活邮件...'});
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

exports.activation = function (req, res) {
  var e = req.body.e || req.param('e');
  var s = 'UPDATE user SET activation_date = ' + new Date().getTime() +
      ' , activation_e = "" WHERE activation_e = "' + e + '"';
  sql.execute(s, function (err, rows, fields) {
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
 * @param  {string} email 注册用户的邮箱
 * @param  {string} password 密码
 * @param  {string} passwordNew 新密码
 */
exports.modify = function (req, res) {

  var email = req.body.email || req.param('email'),
    password = req.body.password || req.param('password'),
    passwordNew = req.body.passwordNew || req.param('passwordNew');

  validUser(email, password)
    .then(function (data) {
      //验证通过
      var deferred = Q.defer();
      var s = 'UPDATE `user` SET `password` = "' + passwordNew + '" WHERE `email` = "' + email + '"';

      sql.execute(s, function (err, rows, fields) {
        if (err) {
          console.log(err);
          deferred.reject({status: 'error', code: 501, msg: err});
        } else {
          deferred.resolve({status: 'success', code: 1, msg: '修改密码成功...'});
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

  var email = req.body.email || req.param('email');

  var userIsExist = function (email) {
    //判断用户名是否正确
    var deferred = Q.defer();
    var s = 'select * from user where email = "' + email + '"';

    sql.execute(s, function (err, rows, fields) {
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

  userIsExist(email)
    .then(function (data) {
      //设置唯一字段rstpwd_e，生效时间字段rstpwd_time，是否生效字段rstpwd_valid
      //e用以确定链接的真实性，time用以确定链接是否因超时而失效，valid在链接第一次被访问后设置为0
      //用来构造一次性链接，点击后失效
      var deferred = Q.defer();
      var MD5 = require('MD5');
      var e = MD5(Math.random());
      var time = new Date().getTime();
      var s = 'UPDATE `user` SET `rstpwd_e` = "' + e + '" , `rstpwd_time` = "' + time +
        '" , `rstpwd_valid` = "1" ' + 'WHERE `email` = "' + email + '"';

      sql.execute(s, function (err, rows, fields) {
        if (err) {
          console.log(err);
          deferred.reject({status: 'error', code: 501, msg: err});
        } else {
          deferred.resolve(e);
        }
      });

      return deferred.promise;
    })
    .then(function (data) {
      //发送带重置密码链接的邮件
      var deferred = Q.defer();
      var transport = require('../util/mail').transport;
      var url = 'http://115.29.179.7/mobile/user/reset?e=' + data + '&email=' + email;
      var mailOptions = {
        from: '皇上<dreamjl@live.cn>', // sender address
        to: email, // list of receivers
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
  var email = req.body.email || req.param('email'),
    e = req.body.e || req.param('e');

  var validURL = function (e, email, time) {
    var deferred = Q.defer();
    var s = 'select * from user where email = "' + email + '"';

    sql.execute(s, function (err, rows, fields) {
      if (err) {
        console.log(err);
        deferred.reject({status: 'error', code: 501, msg: err});
      } else {
        if (rows.length >= 1) {
          var data = rows[0];
          if (data.rstpwd_e !== e) {
            deferred.reject({status: 'error', code: 2, msg: '链接不合法，请使用邮件中提供的有效链接...'});
          } else if (data.rstpwd_valid !== 1) {
            deferred.reject({status: 'error', code: 3, msg: '链接已失效...'});
          } else if ((time - data.rstpwd_time) > 60 * 60 * 1000) {
            deferred.reject({status: 'error', code: 4, msg: '链接已过期...'});
          } else {
            deferred.resolve();
          }
        } else {
          deferred.reject({status: 'error', code: 1, msg: '用户不存在...'});
        }
      }
    });
    return deferred.promise;
  };

  validURL(e, email, new Date().getTime())
    .then(function (data) {
      //将rstpwd_valid字段设置为0
      var deferred = Q.defer();
      var s = 'UPDATE `user` SET `rstpwd_valid` = 0' + ' WHERE `email` = "' + email + '"';
      sql.execute(s, function (err, rows, fields) {
        if (err) {
          console.log(err);
          deferred.reject({status: 'error', code: 501, msg: err});
        } else {
          deferred.resolve({status: 'success', code: 1, msg: '链接有效性验证通过...'});
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

  var email = req.body.email || req.param('email'),
    passwordNew = req.body.passwordNew || req.param('passwordNew'),
    e = req.body.e || req.param('e');

  var modifyPassword = function (email, passwordNew) {
    var deferred = Q.defer();
    var s = 'UPDATE `user` SET `password` = "' + passwordNew + '" , `rstpwd_e` = "" WHERE `email` = "' +
      email + '" AND `rstpwd_e` = "' + e + '"';

    sql.execute(s, function (err, rows, fields) {
      if (err) {
        console.log(err);
        deferred.reject({status: 'error', code: 501, msg: err});
      } else {
        if (rows.length >= 1) {
          deferred.resolve({status: 'success', code: 1, msg: '修改密码成功...'});
        } else {
          deferred.reject({status: 'error', code: 1, msg: '修改密码失败，原因：特征值不匹配或链接已失效...'});
        }
      }
    });
    return deferred.promise;
  };

  modifyPassword(email, passwordNew)
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