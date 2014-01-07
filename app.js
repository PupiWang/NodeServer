
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

server.listen(exports.app.get('port'), function () {

  var nodemailer = require("nodemailer");

  // create reusable transport method (opens pool of SMTP connections)
  var transport = nodemailer.createTransport("SMTP", {
    service: "Hotmail",
    auth: {
      user: 'dreamjl@live.cn',
      pass: 'a7758258'
    }
  });

  // setup e-mail data with unicode symbols
  var mailOptions = {
    from: '皇上<dreamjl@live.cn>', // sender address
    to: 'wz@ov-orange.com', // list of receivers
    subject: 'Node Email Test', // Subject line
    text: 'Node Email Test', // plaintext body
    html: '<b>Node service start</b>' // html body
  };

  transport.sendMail(mailOptions, function (error, response) {
    if (error) {
      console.log(error);
    } else {
      console.log("Message sent: " + response.message);
    }
    // if you don't want to use this transport object anymore, uncomment following line
    //smtpTransport.close(); // shut down the connection pool, no more messages
  });

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
      var i = 0;
      for (i; i < server_socket.serv_sockets.length; i++) {

        var target = server_socket.serv_sockets[i];

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