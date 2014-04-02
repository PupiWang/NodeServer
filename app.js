
// Modules
var express = require('express'),
  http = require('http');

var app = express();

// Files
var socketServer = require('./socketServer'),
    appConf = require('./appConf'),
    appRoutes = require('./appRoutes');

//App config
appConf.appConfig(app);

//App routes
appRoutes.appRoutes(app);

//Socket server initing...
socketServer.socketServer(app);

//Socket client test
var testClient = socketServer.createTestClient(app);

// HTTP Server initing...
var server = require('http').createServer(app);
server.listen(app.get('port'));

// socket.io for websocket
var io = require('socket.io').listen(server);
io.set('log level', 0);
io.sockets.on('connection', function (socket) {
    var socketUtil = require('./util/socketUtil');
    socketUtil.addWebSocket(socket);
    socket.on('send', function (data) {
        var protobuf = require('./util/protobuf');
        testClient.write(protobuf.serializeMessage(data));
    });
});
