var sql = require('../util/sql');

exports.list = function (req, res) {

  var s = 'select * from user';

  sql.execute(s, function (err, rows, fields) {
    if (err) {
      throw err;
    } else {
      res.send(rows);
    }
  });

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
    res.send('email or password is null');
  }

  var MD5 = require('MD5');

  if (password === password_confirm) {

    var s = 'select * from user where email = "' + email + '"';

    sql.execute(s, function (err, rows, fields) {

      if (rows.length >= 1) {

        res.send('email already exist');

      } else {
        //注册时间
        var time = new Date().getTime();

        s = 'insert into user (email,password,datetime_signup,datetime_lastlogin) VALUES ("' +
            email + '","' + MD5(password) + '",' + time + ',' + time + ')';

        sql.execute(s, function (err, rows, fields) {
          if (err) {
            console.log(err);
          } else {
            res.cookie('user', email, {signed: true});
            console.log('session');
            res.send('/userinfo');
          }
        });

      }
    });

  } else {
    res.send('the confirm one is not the same as password');
  }

};

/**
 * 用户登陆
 * @param  {string} email    邮箱
 * @param  {string} password 密码
 */
exports.login = function (req, res) {

  var email = req.body.email,
    password = req.body.password;

  var MD5 = require('MD5');

  if (email && password) {
    var s = 'select password from user where email="' + email + '"';
    sql.execute(s, function (err, rows, fields) {
      if (err) {
        console.log(err);
      } else {
        if (rows.length === 1 && rows[0].password === MD5(password)) {

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
              res.send('/userinfo');
            }
          });

        } else {
          res.send('password error');
        }
      }
    });
  }

};

/**
 * 用户注销
 */
exports.logout = function (req, res) {
  //清除cookie跳转到登陆页面
  res.clearCookie('user');
  res.redirect('/');
};

/**
 * 渲染主页面
 * rows_pic    照片记录集合
 * rows_video  摄像记录集合
 */
exports.userinfo = function (req, res) {
  var s = 'SELECT * FROM resource_picture';

  sql.execute(s, function (err, rows_pic, fields) {
    if (err) {
      console.log(err);
    } else {
      s = 'SELECT * FROM resource_video';
      sql.execute(s, function (err, rows_video, fields) {
        if (err) {
          console.log(err);
        } else {

          var getUrl = require('./qiniu').getUrl;
          var i = 0;
          var obj;

          for (i = rows_pic.length - 1; i >= 0; i--) {
            obj = rows_pic[i];
            obj.url = getUrl('ov-orange-private.u.qiniudn.com', obj.key);
          }

          for (i = rows_video.length - 1; i >= 0; i--) {
            obj = rows_video[i];
            obj.url = getUrl('ov-orange-private.u.qiniudn.com', obj.key);
          }
          res.render('userInfo', {user: req.signedCookies.user, pics: rows_pic, videos: rows_video});
        }
      });
    }
  });
};