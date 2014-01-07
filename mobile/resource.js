var sql = require('../util/sql');

exports.pictures = function (req, res) {
  var email = req.param('email');

  var s = 'SELECT * FROM resource_picture';
  sql.execute(s, function (err, rows, fields) {
    if (err) {
      console.log(err);
    } else {
      res.send({status: 'success', code: 1, msg: '验证通过', results: rows});
    }
  });

};

exports.videos = function (req, res) {
  var email = req.param('email');

  var s = 'SELECT * FROM resource_video';
  sql.execute(s, function (err, rows, fields) {
    if (err) {
      console.log(err);
    } else {
      res.send({status: 'success', code: 1, msg: '验证通过', results: rows});
    }
  });

};