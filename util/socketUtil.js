/**
 * Created by Administrator on 14-2-27.
 */

var clientSocket = {};       //客户端
var deviceSocket = {};       //设备端

exports.getClientSockets = function (userId) {
    var sockets = clientSocket[userId];
    return sockets;
};

exports.getClientSocketBySocketId = function (userId, socketId) {
    var socket = clientSocket[userId];
    var i;
    for (i = 0; i < socket.length ; i ++) {
      if (socket[i].socketId === socketId) {
        return socket[i];
      }
    }
    return null;
};

exports.getDeviceSocket = function (deviceId) {
    var socket = deviceSocket[deviceId];
    return socket;
};

exports.addClientSocket = function (socket) {
  var userId = socket.userId;
  if (!clientSocket[userId]) {
    clientSocket[userId] = [];
  }
  var crypto = require('crypto');
  var shasum = crypto.createHash('sha1');
  var socketId = shasum.update(new Date().getTime() + socket.remoteAddress + socket.remotePort).digest('base64');
  socket.socketId = socketId;
  clientSocket[userId].push(socket);
};

exports.addDeviceSocket = function (socket) {
    var deviceId = socket.deviceId;
    deviceSocket[deviceId] = socket;
    var sql = require('./sql');
    var s = 'UPDATE `device` SET `status` = 1 WHERE `id_device` = "' + deviceId + '"';
    sql.execute(s, function (err) {
        if (err) {
          console.log(err);
        }
    });
    s = 'SELECT id_user FROM user_device WHERE `id_device` = "' + deviceId + '"';
    sql.execute(s, function (err, rows) {
        if (err) {
            console.log(err);
        } else {
            var protobuf = require('./protobuf');
            var i = 0;
            socket.relationUsers = [];
            var message = {
                from : deviceId,
                cmg : 4
            };
            for (i; i < rows.length; i++) {
                socket.relationUsers.push(rows[i]);
                message.to = rows[i];
                protobuf.sendMessageToClientsByUserId(rows[i].id_user, message);
            }
        }
    });
};

exports.removeClientSocket = function (socket) {
  var userId = socket.userId;
  clientSocket[userId].pop(socket);
};

exports.removeDeviceSocket = function (socket) {
  var deviceId = socket.deviceId;
  deviceSocket[deviceId] = null;
  var sql = require('./sql');
  var s = 'UPDATE `device` SET `status` = 0 WHERE `id_device` = "' + deviceId + '"';
  sql.execute(s, function (err) {
    if (err) {
      console.log(err);
    }
  });

  var protobuf = require('./protobuf');
  var i = 0;
  var userId;
  var message = {
    from : socket.deviceId,
    cmg : 5
  };
  for (i; i < socket.relationUsers.length; i++) {
    userId = socket.relationUsers[i];
    message.to = userId;
    protobuf.sendMessageToClientsByUserId(userId, message);
  }
};