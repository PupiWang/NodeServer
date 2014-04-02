/**
 * Created by Administrator on 14-2-27.
 */

var clientSocket = {};       //客户端
var deviceSocket = {};       //设备端
var webSockets = [];         //websocket

var arrayRemove = function(arr,val) {
    var index = arr.indexOf(val);
    if (index > -1) {
        arr.splice(index, 1);
    }
};

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
    var s = sql.deviceSQL.deviceConnect(deviceId);
    sql.execute(s, function (err) {
        if (err) {
          console.log(err);
        }
    });
    s = sql.deviceSQL.getUsersByDevice(deviceId);
    sql.execute(s, function (err, rows) {
        if (err) {
            console.log(err);
        } else {
            var protobuf = require('./protobuf');
            var i = 0;
            socket.relationUsers = [];
            var message = {
                from : deviceId,
                cmd : 4
            };
            for (i; i < rows.length; i++) {
                socket.relationUsers.push(rows[i].id_user);
                message.to = rows[i].id_user;
                protobuf.sendMessageToClientsByUserId(rows[i].id_user, message);
            }
        }
    });
};

var removeClientSocket = function (socket) {
    var userId = socket.userId;
    arrayRemove(clientSocket[userId], socket);
};

var removeDeviceSocket = function (socket) {
  var deviceId = socket.deviceId;
  deviceSocket[deviceId] = null;
  var sql = require('./sql');
    var s = sql.deviceSQL.deviceDisconnect(deviceId);
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
    cmd : 5
  };
  for (i; i < socket.relationUsers.length; i++) {
    userId = socket.relationUsers[i];
    message.to = userId;
    protobuf.sendMessageToClientsByUserId(userId, message);
  }
};

exports.removeSocket = function (socket) {
    if (socket.deviceId) {
        //设备
        console.log('device close : ' + socket.deviceId);
        removeDeviceSocket(socket);
    } else if (socket.userId) {
        //用户
        console.log('client close : ' + socket.userId + ' , ' + socket.socketId);
        removeClientSocket(socket);
    } else {
        //都不是
        console.log('illegal socket close :' + socket.remoteAddress);
    }
};

exports.addWebSocket = function (ws) {
    webSockets.push(ws);
};

exports.removeWebSocket = function (ws) {
    arrayRemove(webSockets, ws);
};

exports.getWebSocket = function () {
    return webSockets;
}