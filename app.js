
// Modules
var express = require('express'),
  http = require('http'),
  path = require('path');

// Files
var routes = require('./routes/index'),
  user = require('./routes/user'),
  m_user = require('./mobile/user'),
  device = require('./routes/device'),
  server_socket = require('./routes/socket'),
  qn = require('./routes/qiniu');

// Server initing...
var app = express(),
  server = require('http').createServer(app),
  io = require('socket.io').listen(server, { log : false });

var log4js = require('log4js');
log4js.configure({
  appenders: [
    { type: 'file', filename: 'logs/' + new Date().getTime() + '.log', category: 'log4jslog' }
  ]
});
//define logger
var logger = log4js.getLogger('log4jslog');
logger.setLevel('INFO');

// All environments
app.set('port', process.env.PORT || 80);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(log4js.connectLogger(logger, { level: 'auto' }));
app.use(express.favicon());
// app.use(express.logger('dev'));
app.use(express.cookieParser('ov_orange'));
app.use(express.bodyParser());
app.use(express.methodOverride());

app.use(function (req, res, next) {

  if (req.signedCookies && req.signedCookies.user) {
    next();
  } else {
    var url = req.originalUrl;

    var jsPattern = /^\/javascripts\//,
      cssPattern = /^\/css\//,
      fontsPattern = /^\/fonts\//,
      imgPattern = /^\/images\//;

    var isStatic = jsPattern.test(url) || cssPattern.test(url) || fontsPattern.test(url) || imgPattern.test(url);

    if (isStatic || url === '/' || url === '/login' || url === '/mobile/login' || url === '/uploadCallback' ||
        url === '/upToken' || url === '/signup' || url === '/mobile/signup') {
      next();
    } else {
      console.log('You need login');
      return res.redirect("/");
    }
  }
});

app.use(app.router);
app.use(express['static'](path.join(__dirname, 'public')));

// development only
if ('development' === app.get('env')) {
  app.use(express.errorHandler());
}

// Get
app.get('/', routes.index);
app.get('/users', user.list);
app.get('/signup', routes.signup);
app.get('/logout', user.logout);
app.get('/userinfo', user.userinfo);
app.get('/devices', device.getDevices);
app.get('/upToken', qn.getUploadToken);

// Post
app.post('/login', user.login);
app.post('/mobile/login', m_user.login);
app.post('/signup', user.signup);
app.post('/mobile/signup', m_user.signup);
app.post('/adddevice', device.addDevice);
app.post('/uploadCallback', qn.uploadCallback);
app.post('/modifydevicename', device.modifyName);

server.listen(app.get('port'), function () {

  var nodemailer = require("nodemailer");

  // create reusable transport method (opens pool of SMTP connections)
  var transport = nodemailer.createTransport("SMTP", {
    service: "Hotmail",
    auth: {
      user: 'dreamjl@live.cn',
      pass: 'a7758258'
    }
  });

  // setup e-mail data with unicode symbols
  var mailOptions = {
    from: '皇上<dreamjl@live.cn>', // sender address
    to: 'wz@ov-orange.com, wjh@ov-orange.com, cl@ov-orange.com', // list of receivers
    subject: 'Node Email Test', // Subject line
    text: 'Node Email Test', // plaintext body
    html: '<b>Node service start</b>' // html body
  };

  transport.sendMail(mailOptions, function (error, response) {
    if (error) {
      console.log(error);
    } else {
      console.log("Message sent: " + response.message);
    }
    // if you don't want to use this transport object anymore, uncomment following line
    //smtpTransport.close(); // shut down the connection pool, no more messages
  });

  io.sockets.on('connection', function (socket) {

    var i = server_socket.serv_sockets.length - 1;
    server_socket.client_sockets.push(socket);

    for (i; i >= 0; i--) {
      socket.emit('device', {'device_id': server_socket.serv_sockets[i].device_id, 'state': 'on'});
    }

    socket.on('init', function (data) {

      socket.user_id = data.user_id;
      console.log(socket.user_id);

    });

    socket.on('oparation', function (data) {
      var i = 0;
      for (i; i < server_socket.serv_sockets.length; i++) {

        var target = server_socket.serv_sockets[i];

        if (target.device_id === data.to) {
          server_socket.protbufConvertor(target, data);
          break;
        }
      }
    });

    socket.on('disconnect', function () {
      server_socket.client_sockets.pop(socket);
    });

  });

});