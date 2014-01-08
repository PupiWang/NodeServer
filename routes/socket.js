
var net = require('net');
var timeout = 20000;//超时
var listenPort = 7003;//监听端口

exports.serv_sockets = [];
exports.client_sockets = [];

var fs = require('fs');
var Schema = require('protobuf').Schema;
var schema = new Schema(fs.readFileSync('buftest.desc'));

var BufTest = schema.BufTest;

exports.protbufConvertor = function (soc, obj) {

  soc.write(BufTest.serialize(obj));

};

var server = net.createServer(function (socket) {
    // 我们获得一个连接 - 该连接自动关联一个socket对象
  console.log('connect: ' + socket.remoteAddress + ':' + socket.remotePort);
  socket.setEncoding('binary');

  //接收到数据
  socket.on('data', function (data) {

    try {
      var obj = BufTest.parse(new Buffer(data));
      var msg = obj.msg;
      var send = {};
      var i, c, s;
      console.log(obj);
      if (msg === 1) {
        // connect
        if (obj.to === 'server') {
          socket.device_id = obj.from;
          exports.serv_sockets.push(socket);
          for (i = exports.client_sockets.length - 1; i >= 0; i--) {
            c = exports.client_sockets[i];
            if (c.write) {
              c.write(BufTest.serialize({from: socket.device_id, to: c.user_id, msg: 'OnLine'}));
            } else {
              c.emit('device', {'device_id': socket.device_id, 'state': 'on'});
            }
          }
        } else if (obj.to === 'client') {
          socket.user_id = obj.from;
          exports.client_sockets.push(socket);
        }

      } else {
        if (socket.device_id) {
          //设备端消息
          if (msg === 2) {
            // ok
            send.cmd = obj.cmd;
            send.status = true;
            for (i = exports.client_sockets.length - 1; i >= 0; i--) {
              c = exports.client_sockets[i];
              if (obj.to === c.user_id) {
                if (c.write) {
                  c.write(data);
                } else {
                  c.emit('oparation', send);
                }
              }
            }
          } else if (msg === 3) {
            // refuse
            send.cmd = obj.cmd;
            send.status = false;
            send.msg = '设备被占用，您的操作被拒绝';
            for (i = exports.client_sockets.length - 1; i >= 0; i--) {
              c = exports.client_sockets[i];
              if (obj.to === c.user_id) {
                if (c.write) {
                  c.write(data);
                } else {
                  c.emit('oparation', send);
                }
              }
            }
          }
        } else if (socket.user_id) {
          //客户端消息
          var flag = false;
          for (i = exports.serv_sockets.length - 1; i >= 0; i--) {
            s = exports.serv_sockets[i];
            if (obj.to === s.device_id) {
              s.write(data);
              flag = true;
            }
          }
          if (!flag) {
            obj.responseStatus = 0;
            obj.info = '操作失败，设备不在线...';
            socket.write(BufTest.serialize(obj));
          }
        }
      }

    } catch (e) {
      console.log(e);
    }

  });

  //数据错误事件
  socket.on('error', function (exception) {
    console.log('socket error:' + exception);
    socket.end();
  });

  //客户端关闭事件
  socket.on('close', function (data) {
    var s, c, i;
    if (socket.device_id) {
      s = socket;
      exports.serv_sockets.pop(s);
      console.log('device close: ' + socket.device_id);
      for (i = exports.client_sockets.length - 1; i >= 0; i--) {
        c = exports.client_sockets[i];
        if (c.write) {
          c.write(BufTest.serialize({from: socket.device_id, to: c.user_id, msg: 'OffLine'}));
        } else {
          c.emit('device', {'device_id': socket.device_id, 'state': 'off'});
        }
      }
    } else if (socket.user_id) {
      c = socket;
      exports.client_sockets.pop(c);
      console.log('client close: ' + socket.user_id);
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