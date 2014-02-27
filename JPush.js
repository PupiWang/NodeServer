var JPush = require('jpush-sdk');

var jpushClient = JPush.build({appkey: "adea89c7fbff918f701059a5", masterSecret: "aed6fb089650a23a76ff0933"});

//var sendno = 1;
//var msgTitle = 'hello';
//var msgContent = 'world';
//
//jpushClient.sendNotificationWithAppKey(sendno, msgTitle, msgContent, function (err, body) {
//    // JPush server message
//    if (err) {
//        console.log('error happened:'+err);
//    }
//    console.log(body);
//});

// type value 的限制与文档一致
var receiver = {};
receiver.type = jpushClient.pushType.tag;
receiver.value = 1;

var msg = {};
msg.content =  'Hi! from boardcast';
msg.platform = jpushClient.platformType.both;

jpushClient.pushAndroidSimpleMessage(1, receiver, msg, function (err, body) {
    // JPush server message
    console.log(body);
});