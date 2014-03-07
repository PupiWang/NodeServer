var JPush = require('jpush-sdk');

var jpushClient = JPush.build({appkey: "adea89c7fbff918f701059a5", masterSecret: "aed6fb089650a23a76ff0933"});

exports.pushMessage = function (tag, content) {
    // type value 的限制与文档一致
    var receiver = {};
    receiver.type = jpushClient.pushType.tag;
    receiver.value = tag;

    var msg = {};
    msg.content = content;
    msg.platform = jpushClient.platformType.both;

    jpushClient.pushAndroidSimpleMessage(1, receiver, msg, function (err, body) {
        // JPush server message
        console.log(body);
    });
};