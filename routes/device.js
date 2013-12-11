
var sql = require('./sql');

exports.getDevices = function (req, res) {

  var email = req.session.role;

  var s = 'select * from user_device where email="' + email + '"';

  sql.execute(s, function (err, rows, fields) {
    if (err) {
      console.log(err);
    } else {
      res.send(rows);
    }
  });

};

exports.addDevice = function (req, res) {

  var email = req.session.role,
    id_device = req.body.device_id;

  var s = 'select * from user_device where email = "' + email + '" and id_device = "' + id_device + '"';

  console.log(s);

  sql.execute(s, function (err, rows, fields) {

    if (rows.length >= 1) {
      res.send('same binding');
    } else {

      s = 'select * from device where id_device = "' + id_device + '"';

      sql.execute(s, function (err, rows, fields) {
        if (err) {
          console.log(err);
        } else {
          if (!rows.length) {
            var s = 'insert into device (id_device,date_activation) VALUES ("' + id_device + '",' + new Date().getTime() + ')';
            sql.execute(s, function (err, rows, fields) {
              if (err) {
                console.log(err);
              }
            });
          }
        }
      });

      s = 'insert into user_device (email,id_device,display_name) VALUES ("' + email + '","' + id_device + '","' + id_device + '")';

      sql.execute(s, function (err, rows, fields) {
        if (err) {
          console.log(err);
        } else {
          res.send('ok');
        }
      });

    }
  });

};

exports.modifyName = function (req, res) {

  var email = req.session.role,
    device_id = req.body.device_id,
    name = req.body.name;

  var s = 'UPDATE user_device SET display_name = "' + name + '" WHERE email = "' + email + '" AND id_device = "' + device_id + '"';

  sql.execute(s, function (err, rows, fields) {
    if (err) {
      console.log(err);
    } else {
      res.send('ok');
    }
  });
};