var sql = require('./sql');

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

exports.signup = function (req, res) {

  var email = req.body.email,
    password = req.body.password,
    password_confirm = req.body.password_confirm;

  var MD5 = require('MD5');

  if (password === password_confirm) {

    var s = 'select * from user where email = "' + email + '"';

    sql.execute(s, function (err, rows, fields) {

      if (rows.length >= 1) {

        res.send('email already exist');

      } else {

        var time = new Date().getTime();

        s = 'insert into user (email,password,datetime_signup,datetime_lastlogin) VALUES ("' +
            email + '","' + MD5(password) + '",' + time + ',' + time + ')';

        sql.execute(s, function (err, rows, fields) {
          if (err) {
            console.log(err);
          } else {
            req.session.role = email;
            res.send('/userinfo');
          }
        });

      }
    });

  } else {
    res.send('the confirm one is not the same as password');
  }

};

exports.login = function (req, res) {

  var email = req.body.email,
    password = req.body.password,
    rememberme = req.body.rememberme;

  console.log('rememberme is ' + rememberme);

  var MD5 = require('MD5');

  if (email && password) {
    var s = 'select password from user where email="' + email + '"';
    sql.execute(s, function (err, rows, fields) {
      if (err) {
        console.log(err);
      } else {
        if (rows.length === 1 && rows[0].password === MD5(password)) {

          var time = new Date().getTime();

          s = 'UPDATE user SET datetime_lastlogin = ' + time + ' WHERE email = "' + email + '"';

          sql.execute(s, function (err, rows, fields) {
            if (err) {
              console.log(err);
              res.send('error');
            } else {
              // req.session.role = email;
              if (rememberme) {
                res.cookie('user', email, { maxAge: 1000 * 60 * 60 * 24 * 7});
              } else {
                req.session.role = email;
                res.clearCookie('user');
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

exports.logout = function (req, res) {
  req.session.role = null;
  res.clearCookie('user');
  res.redirect('/');
};

exports.userinfo = function (req, res) {
  var s = 'SELECT * FROM resource_picture';

  sql.execute(s, function (err, rows, fields) {
    if (err) {
      console.log(err);
    } else {
      res.render('userInfo', {user: req.session.role, pics: rows});
    }
  });

};
