var fs = require('fs');
var Schema = require('protobuf').Schema;
var schema = new Schema(fs.readFileSync('buftest.desc'));

var BufTest = schema.BufTest;

exports.sendMessage = function (socket, data) {
    var sendConsoleLog = require('./socketUtil').sendConsoleLog;
    sendConsoleLog(data, 'send');
    console.log('send : ');
    console.log(data);
    var proData = BufTest.serialize(data);
    socket.write(proData);
};

exports.sendProtobufMessage = function (socket, proData) {
    socket.write(proData);
};

exports.serializeMessage = function (data) {
    var proData = BufTest.serialize(data);
    return proData;
};

exports.resolveMessage = function (proData) {
    var data;
    try{
        data = BufTest.parse(new Buffer(proData));
        console.log('received : ');
        console.log(data);
    } catch(e) {
        console.log(e);
        return null;
    }
    return data;
};

exports.sendMessageToClientsByUserId = function (userId, data) {
    var socketUtil = require('./socketUtil');
    var clientSockets = socketUtil.getClientSockets(userId);
    if (clientSockets) {
        for (var i in clientSockets) {
            if (clientSockets.hasOwnProperty(i)) {
                exports.sendMessage(clientSockets[i], data);
            }
        }
    }
};