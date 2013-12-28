
var sql = require('../util/sql');
/**
 * 根据用户获取设备
 * @param  {string} email 当前用户邮箱
 * @return {array} rows 由设备组成的数组
 */
exports.getDevices = function (req, res) {

  var email = req.signedCookies.user;

  var s = 'select * from user_device where email="' + email + '"';

  sql.execute(s, function (err, rows, fields) {
    if (err) {
      console.log(err);
    } else {
      res.send(rows);
    }
  });

};

/**
 * 为用户添加新设备
 * @param {string} email 当前用户的邮箱
 * @param {string} id_device 新设备的设备ID
 */
exports.addDevice = function (req, res) {

  var email = req.signedCookies.user,
    id_device = req.body.device_id;

  var s = 'select * from user_device where email = "' + email + '" and id_device = "' + id_device + '"';
  //先判断是否已存在该设备
  sql.execute(s, function (err, rows, fields) {

    if (rows.length >= 1) {
      res.send('same binding');
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
          res.send('ok');
        }
      });

    }
  });

};

/**
 * 修改设备的显示名
 * @param  {string} email 当前用户的邮箱
 * @param  {string} device_id 设备ID
 * @param  {string} name 设备显示名
 */
exports.modifyName = function (req, res) {

  var email = req.signedCookies.user,
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