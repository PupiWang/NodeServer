var sql = require('./sql');
var Q = require('q');

exports.isDeviceExist = function (userDeviceObj) {
  var deviceId = userDeviceObj.deviceId;
  var deferred = Q.defer();
  //设备号是否存在
  var s = 'select * from device where id_device = "' + deviceId + '"';
  sql.execute(s, function (err, rows) {
    if (err) {
      console.log(err);
      deferred.reject({status: 'error', code: 501, msg: err});
    } else {
      if (rows.length >= 1) {
        deferred.resolve(userDeviceObj);
      } else {
        deferred.reject({status: 'error', code: 1, msg: '设备号错误，不存在此设备...'});
      }
    }
  });
  return deferred.promise;
};

exports.checkSameBinding = function (userDeviceObj) {
  var userId = userDeviceObj.userId;
  var deviceId = userDeviceObj.deviceId;
  var deferred = Q.defer();
  //检查用户是否绑定过此设备
  var s = 'select * from user_device ud where ud.id_user = "' + userId + '" and ud.id_device = "' + deviceId + '"';

  sql.execute(s, function (err, rows) {
    if (err) {
      console.log(err);
      deferred.reject({status: 'error', code: 501, msg: err});
    } else {
      if (rows.length >= 1) {
        deferred.reject({status: 'error', code: 2, msg: '已经绑定了该设备，无法重复绑定...'});
      } else {
        deferred.resolve(userId);
      }
    }
  });
  return deferred.promise;
};