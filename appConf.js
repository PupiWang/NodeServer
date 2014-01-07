var app = require('./app').app;

var express = require('express');

var path = require('path');

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
app.use(express.cookieParser('ov_orange'));
app.use(express.bodyParser());
app.use(express.methodOverride());

app.use(function (req, res, next) {
  if (req.signedCookies && req.signedCookies.user) {
    next();
  } else {
    var url = req.path;

    var jsPattern = /^\/javascripts\//,
      cssPattern = /^\/css\//,
      fontsPattern = /^\/fonts\//,
      imgPattern = /^\/images\//,
      mobilePattern = /^\/mobile\//;

    var isStatic = jsPattern.test(url) || cssPattern.test(url) || fontsPattern.test(url) ||
        imgPattern.test(url) || mobilePattern.test(url);

    if (isStatic || url === '/' || url === '/login' || url === '/uploadCallback' ||
        url === '/upToken' || url === '/signup') {
      next();
    } else {
      return res.redirect("/");
    }
  }
});

app.use(function (req, res, next) {
  var mobilePattern = /^\/mobile\//;
  var url = req.path;
  if (!mobilePattern.test(url) || url === '/mobile/user/signup') {
    next();
  } else {
    var email = req.body.email || req.param('email'),
      password = req.body.password || req.param('password');

    if (!email || !password) {
      res.send({status: 'error', code: 401, msg: '用户名或密码为空,验证无法通过...'});
    } else {
      var s = 'select * from user where email="' + email + '"';
      var sql = require('./util/sql');
      sql.execute(s, function (err, rows, fields) {
        if (err) {
          console.log(err);
        } else {
          if (rows.length === 1 && rows[0].password === password) {
            next();
          } else {
            res.send({status: 'error', code: 402, msg: '用户名或密码错误...'});
          }
        }
      });
    }
  }
});

app.use(app.router);
app.use(express['static'](path.join(__dirname, 'public')));

// development only
if ('development' === app.get('env')) {
  app.use(express.errorHandler());
}