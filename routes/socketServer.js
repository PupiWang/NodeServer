
exports.socketServer = function (app) {
    var net = require('net');
    var socketUtil = require('../util/socketUtil');
    var protobuf = require('../util/protobuf');
//    var timeout = 20000;//超时
    var listenPort = app.get('socport');//监听端口
    var streamingServerPort = 554;//流媒体服务器端口
    var streamingServerDomain = '115.29.179.7';

    var server = net.createServer(function (socket) {
        //我们获得一个连接 - 该连接自动关联一个socket对象
        socket.setEncoding('binary');
        //接收到数据
        socket.on('data', function (proData) {
            var data = protobuf.resolveMessage(proData);
            if (!data) {
                return;
            }
            var msg = data.msg;
            if (msg === 1) {
                //建立连接
                if (data.to === 'device') {
                    //设备
                    socket.deviceId = data.from;
                    socketUtil.addDeviceSocket(socket);
                    console.log('device connect : ' + socket.deviceId);
                } else if (data.to === 'client') {
                    //用户
                    socket.userId = data.from;
                    socketUtil.addClientSocket(socket);
                    console.log('client connect : ' + socket.userId + ' , ' + socket.socketId);
                } else {
                    //都不是，主动断开
                    socket.destroy();
                }
            } else {
                var REALTIMEVIDEO = 11;
                //一般消息
                if (socket.deviceId) {
                    //设备端消息
                    var clientSocket = socketUtil.getClientSocketBySocketId(data.to, data.socketid);
                    if (clientSocket) {
                        if (data.cmd === REALTIMEVIDEO) {
                            var url = 'rtsp://' + data.domain + ':' + streamingServerPort + '/' + data.sdp;
                            data.info = url;
                        }
                        protobuf.sendMessage(clientSocket, data);
                    }
                } else if (socket.userId) {
                    //客户端消息
                    var deviceSocket = socketUtil.getDeviceSocket(data.to);
                    if (deviceSocket) {
                        if (data.cmd === REALTIMEVIDEO) {
                            data.domain = streamingServerDomain;
                        }
                        data.socketid = socket.socketId;
                        protobuf.sendMessage(deviceSocket,data);
                    } else {
                        var res = {};
                        res.from = data.from;
                        res.to = data.to;
                        res.cmd = data.cmd;
                        res.responseStatus = 2;                                                                         //1代表成功，由设备返回；2代表失败；
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
        socket.on('close', function () {
            if (socket.deviceId) {
                //设备
                console.log('device close : ' + socket.deviceId);
                socketUtil.removeDeviceSocket(socket);
            } else if (socket.userId) {
                //用户
                console.log('client close : ' + socket.userId + ' , ' + socket.socketId);
                socketUtil.removeClientSocket(socket);
            } else {
                //都不是
                console.log('illegal socket close :' + socket.remoteAddress);
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
};