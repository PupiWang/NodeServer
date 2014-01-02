var sql = require('../util/sql');

exports.device = function (req, res) {
  var email = req.param('email'),
    password = req.param('password');

  var s = 'select user_device.*, device.status from user_device, device where email="' + email + '"';

  sql.execute(s, function (err, rows, fields) {
    if (err) {
      console.log(err);
    } else {
      res.send(rows);
    }
  });

};