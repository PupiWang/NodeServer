
// Modules
var express = require('express'),
  http = require('http');

var app = express();

// Files
var socketServer = require('./routes/socketServer'),
    appConf = require('./appConf'),
    appRoutes = require('./appRoutes');

//App config
appConf.appConfig(app);

//App routes
appRoutes.appRoutes(app);

//Socket server initing...
socketServer.socketServer(app);

// HTTP Server initing...
var server = require('http').createServer(app);
server.listen(app.get('port'));
