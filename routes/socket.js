/**
 * Created with JetBrains WebStorm.
 * User: Administrator
 * Date: 12-10-26
 * Time: 下午3:44
 * To change this template use File | Settings | File Templates.
 */

var net = require('net');
var timeout = 20000;//超时
var listenPort = 7003;//监听端口

exports.serv_sockets=[];
exports.client_sockets=[];

exports.protbufConvertor = function(obj) {

    var fs = require('fs');
    var Schema = require('protobuf').Schema;
    var schema = new Schema(fs.readFileSync('amessage.desc'));

    var AMessage = schema['AMessage'];

    return AMessage.serialize(obj);

    // var outOb = BufTest.parse(proto);

}

var server = net.createServer(function(socket){
    // 我们获得一个连接 - 该连接自动关联一个socket对象
    console.log('connect: ' + socket.remoteAddress + ':' + socket.remotePort);
    socket.setEncoding('binary');
    exports.serv_sockets.push(socket);

    socket.write(proto);

    //超时事件
	// socket.setTimeout(timeout,function(){
	// 	console.log('连接超时');
	// 	socket.end();
	// });

    //接收到数据
    socket.on('data',function(data){

        console.log('recv:' + data);

        console.log(BufTest.parse(new Buffer(data)));
        
        for (var i = exports.client_sockets.length - 1; i >= 0; i--) {
            exports.client_sockets[i].emit('data',data)
        };
    });

    //数据错误事件
    socket.on('error',function(exception){
        console.log('socket error:' + exception);
        socket.end();
    });
    //客户端关闭事件
    socket.on('close',function(data){
        console.log('close: ' + socket.remoteAddress + ' ' + socket.remotePort);
        exports.serv_sockets.pop(socket);
    });

}).listen(listenPort);

//服务器监听事件
server.on('listening',function(){
    console.log("server listening:" + server.address().port);
});

//服务器错误事件
server.on("error",function(exception){
    console.log("server error:" + exception);
}); 