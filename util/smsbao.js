var http = require('http');

exports.SMS = function (phone, content) {
  var url = 'http://www.smsbao.com/sms?u=wz@ov-orange.com&p=765440bc30bcdb647011c0ed782f8487&m=' + phone + '&c=' + content;
  http.get(url, function () {
    console.log(url);
  });
};