var fs = require('fs');
var Schema = require('protobuf').Schema;
var schema = new Schema(fs.readFileSync('buftest.desc'));

var BufTest = schema.BufTest;

exports.sendMessage = function (socket, data) {
    console.log('send : ');
    console.log(data);
    var proData = BufTest.serialize(data);
    socket.write(proData);
};

exports.sendProtobufMessage = function (socket, proData) {
    socket.write(proData);
};

exports.resolveMessage = function (proData) {
    var data;
    try{
        data = BufTest.parse(new Buffer(proData));
    } catch(e) {
        console.log(e);
    }
    return data;
};

exports.sendMessageToClientsByUserId = function (userId, data) {
    var socketUtil = require('./socketUtil');
    var clientSockets = socketUtil.getClientSockets(userId);
    var i = 0;
    for (i; i < clientSockets.length; i++) {
        exports.sendMessage(clientSockets[i], data);
    }
};