var sql = require('../util/sql');
// var validUser = require('../util/userUtil').validUser;

exports.pictures = function (req, res) {
  var email = req.param('email'),
    password = req.param('password');
  if (email) {
    var s = 'SELECT * FROM resource_picture';
    sql.execute(s, function (err, rows, fields) {
      if (err) {
        console.log(err);
      } else {
        res.send({status: 'success', code: 1, msg: '验证通过', results: rows});
      }
    });
  } else {
    res.send({status: 'error', code: 1, msg: '身份验证失效，请重新登录...'});
  }
};

exports.videos = function (req, res) {
  var email = req.param('email'),
    password = req.param('password');

  if (email) {
    var s = 'SELECT * FROM resource_video';
    sql.execute(s, function (err, rows, fields) {
      if (err) {
        console.log(err);
      } else {
        res.send({status: 'success', code: 1, msg: '验证通过', results: rows});
      }
    });
  } else {
    res.send({status: 'error', code: 1, msg: '身份验证失效，请重新登录...'});
  }
};