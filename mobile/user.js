var sql = require('../util/sql');
/**
 * 用户登陆
 * @param  {string} email    邮箱
 * @param  {string} password 密码
 */
exports.login = function (req, res) {

  var email = req.body.email;

  var s = 'select password from user where email="' + email + '"';

  var time = new Date().getTime();
  //最近登陆时间
  s = 'UPDATE user SET datetime_lastlogin = ' + time + ' WHERE email = "' + email + '"';

  sql.execute(s, function (err, rows, fields) {
    if (err) {
      console.log(err);
    } else {
      res.send({status: 'success', code: 1, msg: '验证成功，跳转中...'});
    }
  });

};

/**
 * 用户注册
 * @param  {string} email 注册用户的邮箱
 * @param  {string} password 密码
 */
exports.signup = function (req, res) {

  var email = req.body.email,
    password = req.body.password;

  //判断用户名密码是否为空
  if (!email || !password) {
    res.send({status: 'error', code: 1, msg: '资料填写不完整'});
  }

  var s = 'select * from user where email = "' + email + '"';

  sql.execute(s, function (err, rows, fields) {

    if (rows.length >= 1) {

      res.send({status: 'error', code: 3, msg: '用户名已存在'});

    } else {
      //注册时间
      var time = new Date().getTime();

      s = 'insert into user (email,password,datetime_signup,datetime_lastlogin) VALUES ("' +
          email + '","' + password + '",' + time + ',' + time + ')';

      sql.execute(s, function (err, rows, fields) {
        if (err) {
          console.log(err);
        } else {
          // res.cookie('user', email, {signed: true});
          // console.log('session');
          res.send({status: 'success', code: 1, msg: '注册成功'});
        }
      });

    }
  });

};