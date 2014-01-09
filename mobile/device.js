var sql = require('../util/sql');
var validUser = require('../util/userUtil').validUser;
var Q = require('q');

exports.device = function (req, res) {

  var email = req.body.email || req.param('email'),
    password = req.body.password || req.param('password');

  validUser(email, password)
    .then(function () {
      //验证通过
      var deferred = Q.defer();
      var s = 'select ud.id_device, ud.display_name, d.status from user_device ud, device d where email="' +
        email + '" AND ud.id_device = d.id_device';
      sql.execute(s, function (err, rows, fields) {
        if (err) {
          console.log(err);
          deferred.reject({status: 'error', code: 501, msg: err});
        } else {
          deferred.resolve({status: 'success', code: 1, msg: '验证通过', results: rows});
        }
      });
      return deferred.promise;
    })
    .then(function (data) {
      //成功返回结果
      res.send(data);
    })
    .catch(function (error) {
      // Handle any error from all above steps
      console.log('error : ' + error);
      res.send(error);
    });

};

exports.addDevice = function (req, res) {

  var email = req.body.email || req.param('email'),
    password = req.body.password || req.param('password'),
    id_device = req.body.deviceId || req.param('deviceId');

  if (!id_device) {
    res.send({status: 'error', code: 1, msg: '设备ID不符合要求...'});
    return;
  }

  validUser(email, password)
    .then(function (data) {
      //验证通过
      var deferred = Q.defer();
      //设备号是否存在
      var s = 'select * from device where id_device = "' + id_device + '"';
      sql.execute(s, function (err, rows, fields) {
        if (err) {
          console.log(err);
          deferred.reject({status: 'error', code: 501, msg: err});
        } else {
          if (rows.length === 1) {
            deferred.resolve();
          } else {
            deferred.reject({status: 'error', code: 1, msg: '设备号错误，不存在此设备...'});
          }
        }
      });
      return deferred.promise;
    })
    .then(function (data) {
      //设备号正确
      var deferred = Q.defer();
      //检查用户是否绑定过此设备
      var s = 'select * from user_device where email = "' + email + '" and id_device = "' + id_device + '"';
      sql.execute(s, function (err, rows, fields) {
        if (err) {
          console.log(err);
          deferred.reject({status: 'error', code: 501, msg: err});
        } else {
          if (rows.length >= 1) {
            deferred.reject({status: 'error', code: 2, msg: '已经绑定了该设备，无法重复绑定...'});
          } else {
            deferred.resolve();
          }
        }
      });
      return deferred.promise;
    })
    .then(function (data) {
      //不存在相同绑定
      var deferred = Q.defer();
      //绑定设备
      var s = 'insert into user_device (email,id_device,display_name) VALUES ("' +
        email + '","' + id_device + '","' + id_device + '")';
      sql.execute(s, function (err, rows, fields) {
        if (err) {
          console.log(err);
          deferred.reject({status: 'error', code: 501, msg: err});
        } else {
          deferred.resolve({status: 'success', code: 1, msg: '添加设备成功...'});
        }
      });
      return deferred.promise;
    })
    .then(function (data) {
      //成功返回结果
      res.send(data);
    })
    .catch(function (error) {
      // Handle any error from all above steps
      console.log('error : ' + error);
      res.send(error);
    });
};