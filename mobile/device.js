var sql = require('../util/sql');
var deviceUtil = require('../util/deviceUtil');
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

exports.bindingAdmin = function (req, res) {

  var userId = req.body.userId || req.param('userId'),
    password = req.body.password || req.param('password'),
    deviceId = req.body.deviceId || req.param('deviceId');

  var delivaryParams = function (_id) {
    //传递参数
    var deferred = Q.defer();
    var userDeviceObj = {};
    userDeviceObj.userId = _id;
    userDeviceObj.deviceId = deviceId;

    deferred.resolve(userDeviceObj);
    return deferred.promise;
  };

  var isDeviceExist = deviceUtil.isDeviceExist;

  var checkSameBinding = function (userDeviceObj) {
//    userId = userDeviceObj.userId;
    // var deviceId = userDeviceObj.deviceId;
    var deferred = Q.defer();
    //检查用户是否绑定过此设备
    var s = 'select * from user_device ud where ud.id_device = "' + deviceId + '"';

    sql.execute(s, function (err, rows) {
      if (err) {
        console.log(err);
        deferred.reject({status: 'error', code: 501, msg: err});
      } else {
        if (rows.length >= 1) {
          deferred.reject({status: 'error', code: 2, msg: '已经绑定了该设备，无法重复绑定...'});
        } else {
          deferred.resolve(userDeviceObj);
        }
      }
    });
    return deferred.promise;
  };

  var addAdminForDevice = function (userDeviceObj) {
    userId = userDeviceObj.userId;
    // var deviceId = userDeviceObj.deviceId;
    var deferred = Q.defer();
    //绑定设备
    var s = 'insert into user_device (id_user,id_device,display_name,isadmin) VALUES ("' +
      userId + '","' + deviceId + '","' + deviceId + '",1)';
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
    .then(delivaryParams)
    .then(isDeviceExist)
    .then(checkSameBinding)
    .then(addAdminForDevice)
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

exports.bindingUser = function (req, res) {
  var userId = req.body.userId || req.param('userId'),
    password = req.body.password || req.param('password'),
    userIdNew = req.body.userIdNew || req.param('userIdNew'),
    deviceId = req.body.deviceId || req.param('deviceId');

  var delivaryParams = function () {
    //传递参数
    var deferred = Q.defer();

    var type = typeOfUserId(userIdNew);
    var s;
    if (type === 'email') {
      s = 'select _id from user where email = "' + userIdNew + '"';
    } else if (type === 'phone') {
      s = 'select _id from user where phone = "' + userIdNew + '"';
    }

    sql.execute(s, function (err, rows) {
      if (err) {
        console.log(err);
        deferred.reject({status: 'error', code: 501, msg: err});
      } else {
        if (rows.length === 1) {
          var userDeviceObj = {};
          userDeviceObj.userId = rows[0]._id;
          userDeviceObj.deviceId = deviceId;
          deferred.resolve(userDeviceObj);
        } else {
          deferred.reject({status: 'error', code: 402, msg: '用户名错误...'});
        }
      }
    });

    return deferred.promise;
  };

  var isDeviceExist = deviceUtil.isDeviceExist;

  var checkSameBinding = deviceUtil.checkSameBinding;

  var addUserForDevice = function (userId) {
    // var userId = userDeviceObj.userId;
    // var deviceId = userDeviceObj.deviceId;
    var deferred = Q.defer();
    //绑定设备
    var s = 'insert into user_device (id_user,id_device,display_name,isadmin) VALUES ("' +
        userId + '","' + deviceId + '","' + deviceId + '",0)';
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
    .then(delivaryParams)
    .then(isDeviceExist)
    .then(checkSameBinding)
    .then(addUserForDevice)
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

exports.removeUser = function (req, res) {
  var userId = req.body.userId || req.param('userId'),
    password = req.body.password || req.param('password'),
    userIdNew = req.body.userIdNew || req.param('userIdNew'),
    deviceId = req.body.deviceId || req.param('deviceId');

  var delivaryParams = function () {
    //传递参数
    var deferred = Q.defer();

    var type = typeOfUserId(userIdNew);
    var s;
    if (type === 'email') {
      s = 'select _id from user where email = "' + userIdNew + '"';
    } else if (type === 'phone') {
      s = 'select _id from user where phone = "' + userIdNew + '"';
    }

    sql.execute(s, function (err, rows) {
      if (err) {
        console.log(err);
        deferred.reject({status: 'error', code: 501, msg: err});
      } else {
        if (rows.length === 1) {
          var userDeviceObj = {};
          userDeviceObj.userId = rows[0]._id;
          userDeviceObj.deviceId = deviceId;
          deferred.resolve(userDeviceObj);
        } else {
          deferred.reject({status: 'error', code: 402, msg: '用户名错误...'});
        }
      }
    });

    return deferred.promise;
  };

  var isDeviceExist = deviceUtil.isDeviceExist;

  var deleteUserForDevice = function (userDeviceObj) {
    userId = userDeviceObj.userId;
    // var deviceId = userDeviceObj.deviceId;
    var deferred = Q.defer();
    //绑定设备
    var s = 'delete from user_device where id_user = "' + userId + '" and id_device = "' + deviceId + '"';
    sql.execute(s, function (err) {
      if (err) {
        console.log(err);
        deferred.reject({status: 'error', code: 501, msg: err});
      } else {
        deferred.resolve({status: 'success', code: 1, msg: '删除用户成功...'});
      }
    });
    return deferred.promise;
  };

  validUser(userId, password)
    .then(delivaryParams)
    .then(isDeviceExist)
    .then(deleteUserForDevice)
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

exports.modifyDeviceName = function (req, res) {
    var userId = req.body.userId || req.param('userId'),
        password = req.body.password || req.param('password'),
        deviceName = req.body.deviceName || req.param('deviceName'),
        deviceId = req.body.deviceId || req.param('deviceId');

    var modifyDeviceName = function (userId) {
        var deferred = Q.defer();
        var s = 'UPDATE user_device SET display_name = "' + deviceName + '" WHERE id_user = "' + userId + '" AND id_device = "' + deviceId + '"';

        sql.execute(s, function (err, rows, fields) {
            if (err) {
                console.log(err);
            } else {
                deferred.resolve({status: 'success', code: 1, msg: '更改设备名成功...'});
            }
        });
        return deferred.promise;
    };

    validUser(userId, password)
        .then(modifyDeviceName)
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