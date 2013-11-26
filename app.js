
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var device = require('./routes/device');
var server_socket = require('./routes/socket');
var http = require('http');
var path = require('path');
var qn = require('./routes/qiniu');

var app = express();
var server = require('http').createServer(app);
var io= require('socket.io').listen(server);

// var mongoose = require('mongoose');
// mongoose.connect('mongodb://localhost/test');

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser('your secret here'));
app.use(express.session());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

//get
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

//post
app.post('/login', user.login);
app.post('/signup', user.signup);
app.post('/adddevice',device.addDevice);

server.listen(app.get('port'), function(){
	console.log('Express server listening on port ' + app.get('port'));
	var mysql      = require('mysql');
	var connection = mysql.createConnection({
	  host     : 'onoveinmysql.mysql.rds.aliyuncs.com',
	  user     : 'pupi',
	  database : 'onevo',
	  password : 'PUPI_1'
	});

	connection.connect();
	connection.query('SELECT * FROM user', function(err, rows, fields) {
		if (err) throw err;

	    console.log('The solution is: ', rows);
	});
	connection.end();

	io.sockets.on('connection', function (socket) {
		server_socket.client_sockets.push(socket);
		socket.on('my other event', function (data) {
			console.log(data);
			// console.log(server_socket.sockets.length);
			for(var i=0;i<server_socket.serv_sockets.length;i++){
				server_socket.serv_sockets[i].write(data);
			}
		});
	});

});
