var sql = require('../util/sql');

exports.device = function (req, res) {
  var email = req.param('email');

  var s = 'select ud.id_device, ud.display_name, d.status from user_device ud, device d where email="' +
      email + '" AND ud.id_device = d.id_device';

  sql.execute(s, function (err, rows, fields) {
    if (err) {
      console.log(err);
    } else {
      res.send({status: 'success', code: 1, msg: '验证通过', results: rows});
    }
  });

};

exports.addDevice = function (req, res) {
  var email = req.body.email,
    id_device = req.body.deviceId;

  if (!id_device) {
    res.send({status: 'error', code: 2, msg: '设备ID不符合要求...'});
    return;
  }

  var s = 'select * from user_device where email = "' + email + '" and id_device = "' + id_device + '"';
  //先判断是否已存在该设备
  sql.execute(s, function (err, rows, fields) {

    if (rows.length >= 1) {
      res.send({status: 'error', code: 1, msg: '已经绑定了该设备，无法重复绑定...'});
    } else {
      //如果不存在
      //判断device表中有没有这条数据，没有就insert
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
      //建立用户与设备关联关系
      s = 'insert into user_device (email,id_device,display_name) VALUES ("' + email + '","' + id_device + '","' + id_device + '")';

      sql.execute(s, function (err, rows, fields) {
        if (err) {
          console.log(err);
        } else {
          res.send({status: 'success', code: 1, msg: '添加设备成功...'});
        }
      });

    }
  });
};