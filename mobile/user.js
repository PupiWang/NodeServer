var sql = require('../util/sql');
/**
 * 用户登陆
 * @param  {string} email    邮箱
 * @param  {string} password 密码
 */
exports.login = function (req, res) {

  var email = req.body.email,
    password = req.body.password;

  if (email && password) {
    var s = 'select password from user where email="' + email + '"';
    sql.execute(s, function (err, rows, fields) {
      if (err) {
        console.log(err);
      } else {
        if (rows.length === 1) {

          if (rows[0].password !== password) {
            res.send({status: 'error', code: 2, msg: '密码错误'});
            return;
          }

          var time = new Date().getTime();
          //最近登陆时间
          s = 'UPDATE user SET datetime_lastlogin = ' + time + ' WHERE email = "' + email + '"';

          sql.execute(s, function (err, rows, fields) {
            if (err) {
              console.log(err);
              res.send('error');
            } else {
              if (req.body.rememberme === 'true') {
                res.cookie('user', email, { maxAge: 1000 * 60 * 60 * 24 * 7, signed: true});
                console.log('cookie');
              } else {
                res.cookie('user', email, {signed: true});
                console.log('session');
              }
              res.send({status: 'success', code: 1, msg: '验证成功，跳转中...'});
            }
          });

        } else {
          res.send({status: 'error', code: 1, msg: '用户不存在'});
        }
      }
    });
  } else {
    res.send({status: 'error', code: 3, msg: '用户名或密码为空'});
  }

};

/**
 * 用户注册
 * @param  {string} email 注册用户的邮箱
 * @param  {string} password 密码
 * @param  {string} password_confirm 密码确认
 */
exports.signup = function (req, res) {

  var email = req.body.email,
    password = req.body.password,
    password_confirm = req.body.password_confirm;

  //判断用户名密码是否为空
  if (!email || !password || !password_confirm) {
    res.send({status: 'error', code: 1, msg: '资料填写不完整'});
  }

  if (password === password_confirm) {

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
            res.cookie('user', email, {signed: true});
            console.log('session');
            res.send({status: 'success', code: 1, msg: '注册成功'});
          }
        });

      }
    });

  } else {
    res.send({status: 'error', code: 2, msg: '两次密码填写不一致'});
  }

};