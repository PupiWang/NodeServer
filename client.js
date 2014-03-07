var net = require('net');

var socket = net.connect({port:7003});

socket.on('data', function (data) {
    console.log(require('./util/protobuf').resolveMessage(data));
});