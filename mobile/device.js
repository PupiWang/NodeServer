var sql = require('../util/sql');

exports.device = function (req, res) {
  var email = req.param('email'),
    password = req.param('password');

  var s = 'select ud.id_device, ud.display_name, d.status from user_device ud, device d where email="' +
      email + '" AND ud.id_device = d.id_device';

  sql.execute(s, function (err, rows, fields) {
    if (err) {
      console.log(err);
    } else {
      res.send(rows);
    }
  });

};