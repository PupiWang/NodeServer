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