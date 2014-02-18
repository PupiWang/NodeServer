var sql = require('../util/sql');
var userUtil = require('../util/userUtil');
var validUser = userUtil.validUser;
var typeOfUserId = userUtil.typeOfUserId;
var Q = require('q');

exports.device = function (req, res) {

  var userId = req.body.userId || req.param('userId'),
    password = req.body.password || req.param('password');

  var getDevicesByUser = function (_id) {
    //验证通过
    var deferred = Q.defer();
    var s = 'select * from user_device ud, device d ' +
      'where ud.id_device = d.id_device AND ud.id_user = ' + _id;
    sql.execute(s, function (err, rows) {
      if (err) {
        console.log(err);
        deferred.reject({status: 'error', code: 501, msg: err});
      } else {
        deferred.resolve({status: 'success', code: 1, msg: '验证通过', results: rows});
      }
    });
    return deferred.promise;
  };

  validUser(userId, password)
    .then(getDevicesByUser)
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

  var userId = req.body.userId || req.param('userId'),
    password = req.body.password || req.param('password'),
    id_device = req.body.deviceId || req.param('deviceId');

  var isDeviceExist = function (_id) {
    //验证通过
    var deferred = Q.defer();
    //设备号是否存在
    var s = 'select * from device where id_device = "' + id_device + '"';
    sql.execute(s, function (err, rows) {
      if (err) {
        console.log(err);
        deferred.reject({status: 'error', code: 501, msg: err});
      } else {
        if (rows.length >= 1) {
          deferred.resolve(_id);
        } else {
          deferred.reject({status: 'error', code: 1, msg: '设备号错误，不存在此设备...'});
        }
      }
    });
    return deferred.promise;
  };

  var checkSameBinding = function (_id) {
    //设备号正确
    var deferred = Q.defer();
    //检查用户是否绑定过此设备
    var s = 'select * from user_device ud where ud.id_user = "' + _id + '" and ud.id_device = "' + id_device + '"';

    sql.execute(s, function (err, rows) {
      if (err) {
        console.log(err);
        deferred.reject({status: 'error', code: 501, msg: err});
      } else {
        if (rows.length >= 1) {
          deferred.reject({status: 'error', code: 2, msg: '已经绑定了该设备，无法重复绑定...'});
        } else {
          deferred.resolve(_id);
        }
      }
    });
    return deferred.promise;
  };

  var addDevice = function (_id) {
    //不存在相同绑定
    var deferred = Q.defer();
    //绑定设备
    var s = 'insert into user_device (id_user,id_device,display_name) VALUES ("' + _id + '","' + id_device + '","' + id_device + '")';
    sql.execute(s, function (err) {
      if (err) {
        console.log(err);
        deferred.reject({status: 'error', code: 501, msg: err});
      } else {
        deferred.resolve({status: 'success', code: 1, msg: '添加设备成功...'});
      }
    });
    return deferred.promise;
  };

  validUser(userId, password)
    .then(isDeviceExist)
    .then(checkSameBinding)
    .then(addDevice)
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