var sql = require('./sql');
var Q = require('q');

/**
 * 判断账号类型，email or phone
 */
var typeOfUserId = function (userId) {
  var emailReg = /^([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|\_|\.|\.]?)*[a-zA-Z0-9]+\.[a-zA-Z]{2,4}$/,
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

exports.validUser = function (userId, password) {
  var deferred = Q.defer();
  var type = typeOfUserId(userId);
  var s;
  if (userId && password) {
    if (type === 'email') {
      s = 'select * from user where email="' + userId + '"';
    } else if (type === 'phone') {
      s = 'select * from user where phone="' + userId + '"';
    }
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
              deferred.resolve(rows[0]._id);
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

exports.typeOfUserId = function (userId) {
  return typeOfUserId(userId);
};

/**
 * 发送激活账号邮件或短信
 */
exports.sendActivationMessage = function (userId) {
  var deferred = Q.defer();
  var e;
  var type = typeOfUserId(userId);
  var s;
  if (type === 'email') {
    e = require('MD5')(Math.random());
    s = 'UPDATE user SET activation_e = "' + e + '" WHERE email = "' + userId + '"';
    sql.execute(s, function (err) {
      if (err) {
        console.log(err);
      }
    });
    var transport = require('../util/mail').transport;
    var url = 'http://115.29.179.7/mobile/user/activation?e=' + e;
    var mailOptions = {
      from: '皇上<dreamjl@live.cn>', // sender address
      to: userId, // list of receivers
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
    deferred.resolve({status: 'success', code: 1, msg: '注册成功,已发送激活邮件...'});
  } else if (type === 'phone') {
    var SMS = require('./smsbao').SMS;
    e = Math.floor((Math.random() * 9 + 1) * 100000);
    s = 'UPDATE user SET activation_e = "' + e + '" WHERE phone = "' + userId + '"';

    sql.execute(s, function (err) {
      if (err) {
        console.log(err);
      }
    });

    var content = '欢迎注册乐屋安全卫士，您的验证码为：' + e;
    SMS(userId, content);

    deferred.resolve({status: 'success', code: 2, msg: '注册成功,已发送验证码到您的手机...'});
  }
  return deferred.promise;
};

exports.modifyPassword = function (userObj) {
  //验证通过
  var userId = userObj.userId;
  var passwordNew = userObj.passwordNew;
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
        if (!userObj.noticeUser) {
          deferred.resolve({status: 'success', code: 1, msg: '修改密码成功...'});
        }
      } else {
        deferred.reject({status: 'error', code: 601, msg: '修改密码失败...'});
      }
    }
  });

  if (userObj.noticeUser) {
    var origin = userObj.origin;
    if (type === 'email') {
      var transport = require('../util/mail').transport;
      var mailOptions = {
        from: '皇上<dreamjl@live.cn>', // sender address
        to: userId, // list of receivers
        subject: '重置密码', // Subject line
        text: '重置密码', // plaintext body
        html: '<p>您申请重置密码，系统为您生成的密码为：' + origin + '</p>' // html body
      };
      transport.sendMail(mailOptions, function (err, response) {
        if (err) {
          console.log(err);
          deferred.reject({status: 'error', code: 501, msg: err});
        } else {
          console.log("Message sent: " + response.message);
          deferred.resolve({status: 'success', code: 1, msg: '重置后的密码已发送到您的邮箱,请登录后手动修改。'});
        }
      });
    } else if (type === 'phone') {
      var SMS = require('./smsbao').SMS;
      var content = '您申请重置，系统为您生成的密码为：' + origin + '。乐屋安全卫士，如果非本人操作请致电客服。';
      SMS(userId, content);
      deferred.resolve({status: 'success', code: 2, msg: '置后的密码已发送到您的手机，请登录后手动修改。'});
    }
  }
  return deferred.promise;
};