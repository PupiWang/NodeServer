
// Modules
var express = require('express'),
  http = require('http'),
  path = require('path');

exports.app = express();

// Files
var server_socket = require('./routes/socket'),
  appConf = require('./appConf'),
  routes = require('./routes');

// Server initing...
var server = require('http').createServer(exports.app);
var io = require('socket.io').listen(server, { log : false });

// var validUser = require('./util/userUtil').validUser;
// validUser('1@qq.com', 'e10adc3949ba59abbe56e057f20f883e1').then(function (data) {
//   console.log(data);
// }, function (error) {
//   console.log(error);
// });

server.listen(exports.app.get('port'), function () {

  io.sockets.on('connection', function (socket) {

    var i = server_socket.serv_sockets.length - 1;
    server_socket.client_sockets.push(socket);

    for (i; i >= 0; i--) {
      socket.emit('device', {'device_id': server_socket.serv_sockets[i].device_id, 'state': 'on'});
    }

    socket.on('init', function (data) {

      socket.user_id = data.user_id;
      socket.type = 'websocket';
      console.log(socket.user_id);

    });

    socket.on('oparation', function (data) {
      var target;
      i = 0;
      for (i; i < server_socket.serv_sockets.length; i++) {

        target = server_socket.serv_sockets[i];

        if (target.device_id === data.to) {
          server_socket.protbufConvertor(target, data);
          break;
        }
      }
    });

    socket.on('disconnect', function () {
      server_socket.client_sockets.pop(socket);
    });

  });

});