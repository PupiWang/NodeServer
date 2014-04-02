
exports.socketServer = function (app) {
    var net = require('net');
    var socketUtil = require('./util/socketUtil');
    var protobuf = require('./util/protobuf');
    var timeout = 0.1 * 60 * 1000;                               //超时
    var listenPort = app.get('socport');                        //监听端口
    var streamingServerPort = 554;                              //流媒体服务器端口
    var streamingServerDomain = '115.29.179.7';

    var server = net.createServer(function (socket) {
        //我们获得一个连接 - 该连接自动关联一个socket对象
        socket.remoteInfo = socket.remoteAddress + ':' + socket.remotePort
        console.log('connect:' + socket.remoteInfo);
        socket.setEncoding('binary');
        socket.setNoDelay(true);                                //禁用Nagle算法
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
                } else {
                    console.log('can not know msg resource');
                    //都不是，主动断开
                    socket.destroy();
                }
            }
        });

        //数据错误事件
        socket.on('error', function (exception) {
            console.log('socket error:' + socket.remoteInfo + '\n' + exception);
            socketUtil.removeSocket(socket);
            socket.end();
        });

        //客户端关闭事件
        socket.on('close', function () {
            console.log('error:' + socket.remoteInfo);
            socketUtil.removeSocket(socket);
        });

        if (socket.remoteAddress != '127.0.0.1') {
            //超时事件
            socket.setTimeout(timeout,function(){
                console.log('timeout:' + socket.remoteInfo);
                socketUtil.removeSocket(socket);
                socket.end();
            });
        }

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

exports.createTestClient = function (app) {

    var net = require('net');
    var listenPort = app.get('socport');                        //监听端口
    var protobuf = require('./util/protobuf');
    var init = {
        from: 'test',
        to: 'client',
        msg: 1
    };

    var client = net.connect(listenPort, function () {
        console.log('TestClient connected');
        client.write(protobuf.serializeMessage(init));
    });

    client.on('data', function(prodata) {
        var data = protobuf.resolveMessage(prodata);
        var socketUtil = require('./util/socketUtil');
        socketUtil.getWebSocket().forEach(function (ws) {
            ws.emit('receive', data);
        });
    });

    client.on('error', function(err) {
        console.log(err);
    });

    client.on('end', function() {
        console.log('TestClient disconnected');
    });

    return client;
};