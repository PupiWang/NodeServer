
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
	io= require('socket.io').listen(server , { log : false });

// All environments
app.set('port', process.env.PORT || 80);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser('ov_orange'));
app.use(express.session());

app.use(function(req, res, next){
	var url = req.originalUrl;
	if (url != '/upToken' && url != '/signup' && url != '/' && url != '/javascripts/jquery-1.10.2.min.js' 
		&& url != '/login' && !req.session.role && url != '/uploadCallback' && url != '/javascripts/jquery.cookie.js') {
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
app.get('/logout', user.logout);
app.get('/userinfo', user.userinfo);
app.get('/websocket', function(req, res){
    res.render('socket');
});
app.get('/devices',device.getDevices);
app.get('/upToken',qn.getUploadToken);
// app.get('/downloadToken',qn.getDownloadUrl);
app.get('/upLoadFile',routes.upLoadFile);

// Post
app.post('/login', user.login);
app.post('/signup', user.signup);
app.post('/adddevice',device.addDevice);
app.post('/uploadCallback',qn.uploadCallback);
app.post('/modifydevicename', device.modifyName);

server.listen(app.get('port'), function(){
	
	io.sockets.on('connection', function (socket) {
		server_socket.client_sockets.push(socket);

		for (var i = server_socket.serv_sockets.length - 1; i >= 0; i--) {
            socket.emit('device',{'device_id':server_socket.serv_sockets[i].device_id,'state':'on'})
        };

		socket.on('init',function(data){

			socket.user_id = data.user_id;

			console.log(socket.user_id);

		})

		socket.on('oparation', function (data) {

			for(var i = 0 ; i < server_socket.serv_sockets.length ; i++){

				var target = server_socket.serv_sockets[i];

				if(target.device_id == data.to){
					server_socket.protbufConvertor(target,data);
					break;
				}

			}
		});
	});

});
