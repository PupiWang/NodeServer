
// Modules
var express = require('express'),
	http = require('http'),
	path = require('path');

// Files
var routes = require('./routes'),
	user = require('./routes/user'),
	device = require('./routes/device'),
	server_socket = require('./routes/socket'),
	qn = require('./routes/qiniu');

// Server initing...
var app = express(),
	server = require('http').createServer(app),
	io= require('socket.io').listen(server);

// All environments
app.set('port', process.env.PORT || 80);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser('your secret here'));
app.use(express.session());

app.use(function(req, res, next){
	var url = req.originalUrl;
	if (url != '/upToken' && url != '/signup' && url != '/' && url != '/javascripts/jquery-1.10.2.min.js' 
		&& url != '/login' && !req.session.role && url != '/uploadCallback') {
		return res.redirect("/");
	}

	next();
});

app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

// Get
app.get('/', routes.index);
app.get('/users', user.list);
app.get('/userinfo', user.userinfo);
app.get('/websocket', function(req, res){
    res.render('socket');
});
app.get('/devices',device.getDevices);
app.get('/upToken',qn.getUploadToken);
app.get('/downloadToken',qn.getDownloadUrl);
app.get('/upLoadFile',routes.upLoadFile);

// Post
app.post('/login', user.login);
app.post('/signup', user.signup);
app.post('/adddevice',device.addDevice);
app.post('/uploadCallback',qn.uploadCallback)

server.listen(app.get('port'), function(){
	
	io.sockets.on('connection', function (socket) {
		server_socket.client_sockets.push(socket);
		socket.on('my other event', function (data) {
			console.log(data);
			for(var i=0;i<server_socket.serv_sockets.length;i++){
				server_socket.serv_sockets[i].write(data);
			}
		});
	});

});
