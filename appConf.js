
exports.appConfig = function (app) {

    var express = require('express');

    var path = require('path');

    var log4js = require('log4js');
    log4js.configure({
        appenders: [
            { type: 'file', filename: 'logs/' + new Date().getTime() + '.log', category: 'log4jslog' }
        ]
    });
    //logger
    var logger = log4js.getLogger('log4jslog');
    logger.setLevel('INFO');

    //环境变量
    app.set('port', 80);                                                                                                //HTTP服务器端口
    app.set('socport', 7003);                                                                                           //TCP服务器端口
    app.set('views', path.join(__dirname, 'views'));                                                                    //设置视图目录
    app.set('view engine', 'ejs');                                                                                      //设置视图模板引擎

    //中间件
    app.use(express.compress());                                                                                        //压缩响应数据
    app.use(log4js.connectLogger(logger, { level: 'auto' }));                                                           //日志跟踪
    app.use(express.favicon());                                                                                         //favicon
    app.use(express.cookieParser('ov_orange'));                                                                         //cookie解析并用ov_orange签名
    app.use(express.bodyParser());                                                                                      //解析请求body
    app.use(express.methodOverride());
    app.use(express['static'](path.join(__dirname, 'public')));                                                         //静态文件目录

    app.use(function (req, res, next) {
        if (req.signedCookies && req.signedCookies.user) {
            next();
        } else {
            var url = req.path.toLowerCase();
            console.log(url);
            if (url === '/sockettest' || url === '/doc.html') {
                return res.redirect("/background");
            }
            next();

//            var jsPattern = /^\/javascripts\//,
//                cssPattern = /^\/css\//,
//                fontsPattern = /^\/fonts\//,
//                imgPattern = /^\/images\//,
//                productPagePattern = /^\/product/,
//                staticPattern = /^\/static\//,
//                mobilePattern = /^\/mobile\//;
//
//            var isStatic = jsPattern.test(url) || cssPattern.test(url) || fontsPattern.test(url) ||
//                imgPattern.test(url) || mobilePattern.test(url) || productPagePattern.test(url) || staticPattern.test(url);
//
//            if (isStatic || url === '/' || url === '/login' || url === '/uploadCallback' ||
//                url === '/upToken' || url === '/signup' || url === '/AndroidOnevo.apk' || url === '/LewuSafeGuard.apk') {
//                next();
//            } else {
//                return res.redirect("/");
//            }
        }
    });

    app.use(app.router);

    // development only
    if ('development' === app.get('env')) {
        app.use(express.errorHandler());
    }
};