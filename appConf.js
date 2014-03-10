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
      productPagePattern = /^\/product/,
      mobilePattern = /^\/mobile\//;

    var isStatic = jsPattern.test(url) || cssPattern.test(url) || fontsPattern.test(url) ||
        imgPattern.test(url) || mobilePattern.test(url) || productPagePattern.test(url);

    if (isStatic || url === '/' || url === '/login' || url === '/uploadCallback' ||
        url === '/upToken' || url === '/signup' || url === '/AndroidOnevo.apk' || url === '/LewuSafeGuard.apk') {
      next();
    } else {
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