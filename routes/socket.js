
var net = require('net');
var socketUtil = require('../util/socketUtil');
var protobuf = require('../util/protobuf');
var timeout = 20000;//超时
var listenPort = 7003;//监听端口

var server = net.createServer(function (socket) {
  //我们获得一个连接 - 该连接自动关联一个socket对象
  console.log('connect: ' + socket.remoteAddress + ':' + socket.remotePort);
  socket.setEncoding('binary');
  //接收到数据
  socket.on('data', function (proData) {
      var data = protobuf.resolveMessage(proData);
      var msg = data.msg;
      var send = {};
      var i, c, s;
      console.log(data);
      if (msg === 1) {
        //建立连接
        if (data.to === 'device') {
          socket.device_id = data.from;
          socketUtil.addDeviceSocket(socket);
        } else if (data.to === 'client') {
          socket.userId = data.from;
          socketUtil.addClientSocket(socket);
        }
      } else {
        //一般消息
        if (socket.device_id) {
          //设备端消息
          var clientSocket = socketUtil.getClientSocketBySocketId(data.to, data.socketid);
          if (clientSocket) {
            protobuf.sendMessage(clientSocket, data);
          }
        } else if (socket.user_id) {
          //客户端消息
          var deviceSocket = socketUtil.getDeviceSocket(data.to);
          if (deviceSocket) {
            data.socketid = socket.socketId;
            protobuf.sendMessage(deviceSocket,data);
          } else {
            var res = {};
            res.from = data.from;
            res.to = data.to;
            res.responseStatus = 0;
            res.info = '操作失败，设备不在线...';
            protobuf.sendMessage(socket,res);
          }
        }
      }
  });

  //数据错误事件
  socket.on('error', function (exception) {
    console.log('socket error:' + exception);
    socket.end();
  });

  //客户端关闭事件
  socket.on('close', function (data) {
    if (socket.device_id) {
      socketUtil.removeDeviceSocket(socket);
    } else if (socket.user_id) {
      socketUtil.removeClientSocket(socket);
    }
  });

    //超时事件
    // socket.setTimeout(timeout,function(){
    //  console.log('连接超时');
    //  socket.end();
    // });

}).listen(listenPort);

//服务器监听事件
server.on('listening', function () {
  console.log("server listening:" + server.address().port);
});

//服务器错误事件
server.on("error", function (exception) {
  console.log("server error:" + exception);
});