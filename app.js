
// Modules
var express = require('express'),
  http = require('http'),
  path = require('path');

// Files
var routes = require('./routes/index'),
  user = require('./routes/user'),
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
    { type: 'console' },
    { type: 'file', filename: 'logs/' + new Date().getTime() + '.log', category: 'log4jslog' }
  ],
  replaceConsole: true
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

    if (isStatic || url === '/' || url === '/login' || url === '/uploadCallback' || url === '/upToken' || url === '/signup') {
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
app.get('/websocket', function (req, res) {
  res.render('socket');
});
app.get('/devices', device.getDevices);
app.get('/upToken', qn.getUploadToken);
// app.get('/downloadToken',qn.getDownloadUrl);
app.post('/getPicture', qn.getPictureDownloadUrl);

// Post
app.post('/login', user.login);
app.post('/signup', user.signup);
app.post('/adddevice', device.addDevice);
app.post('/uploadCallback', qn.uploadCallback);
app.post('/modifydevicename', device.modifyName);

server.listen(app.get('port'), function () {
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