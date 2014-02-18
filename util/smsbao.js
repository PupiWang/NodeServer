var http = require('http');

exports.SMS = function (phone, content) {
  var url = 'http://www.smsbao.com/sms?u=USERNAME&p=PASSWORD&m=' + phone + '&c=' + content;
  http.get(url, function () {
    console.log(url);
  });
};