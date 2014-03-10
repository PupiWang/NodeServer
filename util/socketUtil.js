/**
 * Created by Administrator on 14-2-27.
 */

var clientSocket = {};       //客户端
var deviceSocket = {};       //设备端

exports.getClientSocket = function (userId) {
    var socket = clientSocket[userId];
    return socket;
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
};